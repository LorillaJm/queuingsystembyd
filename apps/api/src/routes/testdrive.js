import express from 'express';
import { saveTestDriveDocuments } from '../controllers/testDriveController.js';

const router = express.Router();

/**
 * POST /api/testdrive/documents
 * Save test drive documents (ID images and signature)
 * Body: { fullName, mobile, idFront, idBack, signature }
 */
router.post('/documents', saveTestDriveDocuments);

export default router;
