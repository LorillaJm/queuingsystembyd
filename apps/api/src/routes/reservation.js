import express from 'express';
import { saveReservationDocuments } from '../controllers/reservationController.js';

const router = express.Router();

/**
 * POST /api/reservation/documents
 * Save reservation documents (2 Government IDs and payment mode)
 * Body: { fullName, mobile, govId1Front, govId1Back, govId2Front, govId2Back, paymentMode }
 */
router.post('/documents', saveReservationDocuments);

export default router;
