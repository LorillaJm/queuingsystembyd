import express from 'express';
import { checkStaffAuth } from '../middleware/auth.js';
import { staffLimiter } from '../middleware/rateLimiter.js';
import { 
  pinValidation, 
  queueNumberValidation, 
  branchQueryValidation,
  branchValidation,
  carCreateValidation,
  carUpdateValidation
} from '../middleware/validation.js';
import {
  verifyPin,
  getTickets,
  next,
  nextModel,
  call,
  markDone,
  noShow,
  getStats
} from '../controllers/staffController.js';
import {
  createCar,
  updateCar,
  getCars,
  toggleCarActive,
  deleteCar
} from '../controllers/carController.js';
import {
  getDashboard,
  getDashboardSummary
} from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * POST /api/staff/auth
 * Verify staff PIN
 * Rate limited: 30 requests per minute
 */
router.post('/auth',
  staffLimiter,
  pinValidation,
  verifyPin
);

/**
 * GET /api/staff/tickets?branch=MAIN
 * Get all active tickets for staff view
 * Requires staff authentication
 */
router.get('/tickets',
  checkStaffAuth,
  branchQueryValidation,
  getTickets
);

/**
 * POST /api/staff/next
 * Call next waiting ticket
 * Requires staff authentication
 * Body: { branch }
 */
router.post('/next',
  checkStaffAuth,
  branchValidation,
  next
);

/**
 * POST /api/staff/next-model
 * Call next waiting ticket for specific model
 * Requires staff authentication
 * Body: { branch, model }
 */
router.post('/next-model',
  checkStaffAuth,
  branchValidation,
  nextModel
);

/**
 * POST /api/staff/call
 * Call specific ticket by queue number
 * Requires staff authentication
 * Body: { branch, queueNo }
 */
router.post('/call',
  checkStaffAuth,
  [
    ...branchValidation,
    ...queueNumberValidation
  ],
  call
);

/**
 * POST /api/staff/mark-done
 * Mark ticket as completed
 * Requires staff authentication
 * Body: { branch, queueNo }
 */
router.post('/mark-done',
  checkStaffAuth,
  [
    ...branchValidation,
    ...queueNumberValidation
  ],
  markDone
);

/**
 * POST /api/staff/no-show
 * Mark ticket as no-show
 * Requires staff authentication
 * Body: { branch, queueNo }
 */
router.post('/no-show',
  checkStaffAuth,
  [
    ...branchValidation,
    ...queueNumberValidation
  ],
  noShow
);

/**
 * GET /api/staff/stats?branch=MAIN
 * Get queue statistics
 * Requires staff authentication
 */
router.get('/stats',
  checkStaffAuth,
  branchQueryValidation,
  getStats
);

/**
 * GET /api/staff/dashboard?branch=MAIN
 * Get dashboard data with all active cars and their counts
 * Requires staff authentication
 */
router.get('/dashboard',
  checkStaffAuth,
  branchQueryValidation,
  getDashboard
);

/**
 * GET /api/staff/dashboard/summary
 * Get summary for all branches
 * Requires staff authentication
 */
router.get('/dashboard/summary',
  checkStaffAuth,
  getDashboardSummary
);

/**
 * POST /api/staff/cars
 * Create new car/model
 * Requires staff authentication
 * Body: { branch, model, capacity?, displayOrder?, imageUrl? }
 */
router.post('/cars',
  checkStaffAuth,
  carCreateValidation,
  createCar
);

/**
 * GET /api/staff/cars?branch=MAIN&includeInactive=false
 * Get all cars for a branch
 * Requires staff authentication
 */
router.get('/cars',
  checkStaffAuth,
  branchQueryValidation,
  getCars
);

/**
 * PATCH /api/staff/cars/:id
 * Update car/model
 * Requires staff authentication
 * Body: { model?, capacity?, displayOrder?, imageUrl?, isActive? }
 */
router.patch('/cars/:id',
  checkStaffAuth,
  carUpdateValidation,
  updateCar
);

/**
 * PATCH /api/staff/cars/:id/toggle
 * Toggle car active status
 * Requires staff authentication
 */
router.patch('/cars/:id/toggle',
  checkStaffAuth,
  toggleCarActive
);

/**
 * DELETE /api/staff/cars/:id
 * Delete car/model
 * Requires staff authentication
 */
router.delete('/cars/:id',
  checkStaffAuth,
  deleteCar
);

export default router;
