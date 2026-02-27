import { body, param, query } from 'express-validator';

// Registration validation
export const registrationValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s'-]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, hyphens and apostrophes'),
  
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Invalid mobile number format (8-20 characters)'),
  
  body('carId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Car ID cannot be empty'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters'),
  
  body('salesConsultant')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Sales consultant name must be between 2 and 100 characters'),
  
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .toUpperCase()
    .isLength({ max: 10 })
    .withMessage('Branch code must be less than 10 characters')
    .matches(/^[A-Z]+$/)
    .withMessage('Branch code must contain only uppercase letters'),
  
  body('purpose')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Allow single value or comma-separated values
      const purposes = value.split(',').map(p => p.trim());
      const validPurposes = ['CIS', 'TEST_DRIVE', 'RESERVATION'];
      const allValid = purposes.every(p => validPurposes.includes(p));
      if (!allValid) {
        throw new Error('Invalid purpose. Must be CIS, TEST_DRIVE, or RESERVATION');
      }
      return true;
    })
    .withMessage('Invalid purpose. Must be CIS, TEST_DRIVE, or RESERVATION')
];

// Queue number validation
export const queueNumberValidation = [
  body('queueNo')
    .notEmpty()
    .withMessage('Queue number is required')
    .matches(/^\d{3}$/)
    .withMessage('Invalid queue number format (must be NNN)')
];

// Branch validation (for body)
export const branchValidation = [
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .toUpperCase()
    .matches(/^[A-Z]+$/)
    .withMessage('Branch code must contain only uppercase letters')
];

// Branch validation (for query params)
export const branchQueryValidation = [
  query('branch')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]+$/)
    .withMessage('Branch code must contain only uppercase letters')
];

// Branch validation (for URL params)
export const branchParamValidation = [
  param('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .toUpperCase()
    .matches(/^[A-Z]+$/)
    .withMessage('Branch code must contain only uppercase letters')
];

// PIN validation
export const pinValidation = [
  body('pin')
    .notEmpty()
    .withMessage('PIN is required')
    .isLength({ min: 4 })
    .withMessage('PIN must be at least 4 characters')
];

// Status validation
export const statusValidation = [
  body('status')
    .optional()
    .isIn(['WAITING', 'SERVING', 'DONE', 'NOSHOW'])
    .withMessage('Invalid status. Must be WAITING, SERVING, DONE, or NOSHOW')
];

// Settings validation
export const settingsValidation = [
  body('staffPin')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('Staff PIN must be between 4 and 20 characters'),
  
  body('allowedBranches')
    .optional()
    .isArray()
    .withMessage('Allowed branches must be an array'),
  
  body('allowedBranches.*.code')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]+$/)
    .withMessage('Branch code must contain only uppercase letters'),
  
  body('allowedBranches.*.prefix')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]+$/)
    .withMessage('Branch prefix must contain only uppercase letters'),
  
  body('dailyResetTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Daily reset time must be in HH:MM format (24-hour)'),
  
  body('maxQueuePerDay')
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage('Max queue per day must be between 1 and 999')
];

// Car model validation (create)
export const carCreateValidation = [
  body('branch')
    .trim()
    .notEmpty().withMessage('Branch is required')
    .toUpperCase()
    .isLength({ max: 10 }).withMessage('Branch must be at most 10 characters')
    .matches(/^[A-Z]+$/).withMessage('Branch code must contain only uppercase letters'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required')
    .isLength({ min: 1, max: 60 }).withMessage('Model must be between 1 and 60 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
  body('displayOrder')
    .optional()
    .isInt({ min: 1, max: 999 }).withMessage('Display order must be between 1 and 999'),
  body('imageUrl')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image URL must be at most 500 characters')
];

// Car model validation (update)
export const carUpdateValidation = [
  body('model')
    .optional()
    .trim()
    .notEmpty().withMessage('Model cannot be empty')
    .isLength({ min: 1, max: 60 }).withMessage('Model must be between 1 and 60 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
  body('displayOrder')
    .optional()
    .isInt({ min: 1, max: 999 }).withMessage('Display order must be between 1 and 999'),
  body('imageUrl')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image URL must be at most 500 characters'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];
