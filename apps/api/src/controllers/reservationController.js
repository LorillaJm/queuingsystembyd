import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/reservation');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save Reservation documents (2 Government IDs and payment mode)
 * POST /api/reservation/documents
 */
export async function saveReservationDocuments(req, res) {
  try {
    const { 
      fullName, 
      mobile, 
      govId1Front, 
      govId1Back, 
      govId2Front, 
      govId2Back, 
      paymentMode,
      vehicleModel,
      variants,
      color
    } = req.body;

    // Require at least one complete ID (front and back) and payment mode
    const hasId1 = govId1Front && govId1Back;
    const hasId2 = govId2Front && govId2Back;

    if (!hasId1 && !hasId2) {
      return res.status(400).json({
        success: false,
        error: 'Missing required documents',
        message: 'At least one government ID (front and back) is required'
      });
    }

    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment mode',
        message: 'Payment mode is required'
      });
    }

    // Create a unique folder for this customer
    const timestamp = Date.now();
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const customerFolder = path.join(uploadsDir, `${timestamp}_${sanitizedName}`);
    
    if (!fs.existsSync(customerFolder)) {
      fs.mkdirSync(customerFolder, { recursive: true });
    }

    const files = {};

    // Save Government ID 1 if provided
    if (govId1Front && govId1Back) {
      const govId1FrontData = govId1Front.replace(/^data:image\/\w+;base64,/, '');
      const govId1FrontPath = path.join(customerFolder, 'gov_id1_front.png');
      fs.writeFileSync(govId1FrontPath, govId1FrontData, 'base64');
      files.govId1Front = 'gov_id1_front.png';

      const govId1BackData = govId1Back.replace(/^data:image\/\w+;base64,/, '');
      const govId1BackPath = path.join(customerFolder, 'gov_id1_back.png');
      fs.writeFileSync(govId1BackPath, govId1BackData, 'base64');
      files.govId1Back = 'gov_id1_back.png';
    }

    // Save Government ID 2 if provided
    if (govId2Front && govId2Back) {
      const govId2FrontData = govId2Front.replace(/^data:image\/\w+;base64,/, '');
      const govId2FrontPath = path.join(customerFolder, 'gov_id2_front.png');
      fs.writeFileSync(govId2FrontPath, govId2FrontData, 'base64');
      files.govId2Front = 'gov_id2_front.png';

      const govId2BackData = govId2Back.replace(/^data:image\/\w+;base64,/, '');
      const govId2BackPath = path.join(customerFolder, 'gov_id2_back.png');
      fs.writeFileSync(govId2BackPath, govId2BackData, 'base64');
      files.govId2Back = 'gov_id2_back.png';
    }

    // Save metadata including vehicle selection
    const metadata = {
      fullName,
      mobile,
      paymentMode,
      vehicleModel: vehicleModel || null,
      variants: variants || null,
      color: color || null,
      timestamp,
      files
    };
    const metadataPath = path.join(customerFolder, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Reservation documents saved successfully',
      data: {
        folder: customerFolder,
        timestamp,
        paymentMode,
        vehicleModel,
        variants,
        color
      }
    });

  } catch (error) {
    console.error('Save reservation documents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save documents',
      message: error.message
    });
  }
}
