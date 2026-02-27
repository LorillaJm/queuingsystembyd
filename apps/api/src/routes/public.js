import express from 'express';
import { registrationLimiter } from '../middleware/rateLimiter.js';
import { registrationValidation, branchQueryValidation } from '../middleware/validation.js';
import {
  register,
  getTicket,
  getQueue,
  getBranches,
  getPublicCars,
  getPublicRegistrations
} from '../controllers/registrationController.js';

const router = express.Router();

/**
 * POST /api/register
 * Register new customer and generate queue number
 * Rate limited: 10 requests per 15 minutes per IP
 */
router.post('/register',
  registrationLimiter,
  registrationValidation,
  register
);

/**
 * GET /api/ticket/:id
 * Get ticket information by ID
 */
router.get('/ticket/:id', getTicket);

/**
 * GET /api/queue?branch=MAIN
 * Get queue status for a branch
 */
router.get('/queue',
  branchQueryValidation,
  getQueue
);

/**
 * GET /api/branches
 * Get all active branches
 */
router.get('/branches', getBranches);

/**
 * GET /api/cars?branch=MAIN
 * Get active cars/models for a branch
 * Public endpoint for registration form
 */
router.get('/cars',
  branchQueryValidation,
  getPublicCars
);

/**
 * GET /api/registrations?branch=MAIN
 * Get all active registrations for MC/Display screens
 * Public endpoint for announcer view
 */
router.get('/registrations',
  branchQueryValidation,
  getPublicRegistrations
);

export default router;
