import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/testdrive');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save Test Drive documents (ID and signature)
 * POST /api/testdrive/documents
 */
export async function saveTestDriveDocuments(req, res) {
  try {
    const { fullName, mobile, idFront, idBack, signature } = req.body;

    if (!idFront || !idBack || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required documents',
        message: 'ID front, ID back, and signature are required'
      });
    }

    // Create a unique folder for this customer
    const timestamp = Date.now();
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const customerFolder = path.join(uploadsDir, `${timestamp}_${sanitizedName}`);
    
    if (!fs.existsSync(customerFolder)) {
      fs.mkdirSync(customerFolder, { recursive: true });
    }

    // Save ID Front
    const idFrontData = idFront.replace(/^data:image\/\w+;base64,/, '');
    const idFrontPath = path.join(customerFolder, 'id_front.png');
    fs.writeFileSync(idFrontPath, idFrontData, 'base64');

    // Save ID Back
    const idBackData = idBack.replace(/^data:image\/\w+;base64,/, '');
    const idBackPath = path.join(customerFolder, 'id_back.png');
    fs.writeFileSync(idBackPath, idBackData, 'base64');

    // Save Signature
    const signatureData = signature.replace(/^data:image\/\w+;base64,/, '');
    const signaturePath = path.join(customerFolder, 'signature.png');
    fs.writeFileSync(signaturePath, signatureData, 'base64');

    // Save metadata
    const metadata = {
      fullName,
      mobile,
      timestamp,
      files: {
        idFront: 'id_front.png',
        idBack: 'id_back.png',
        signature: 'signature.png'
      }
    };
    const metadataPath = path.join(customerFolder, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Test drive documents saved successfully',
      data: {
        folder: customerFolder,
        timestamp
      }
    });

  } catch (error) {
    console.error('Save test drive documents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save documents',
      message: error.message
    });
  }
}
