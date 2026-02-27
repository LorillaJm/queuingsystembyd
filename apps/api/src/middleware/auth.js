import Settings from '../models/firebase/Settings.js';

/**
 * Verify staff PIN (middleware for auth endpoint)
 */
export const verifyStaffPin = async (req, res, next) => {
  const { pin } = req.body;
  
  try {
    const isValid = await Settings.verifyPin(pin);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid PIN',
        message: 'The provided PIN is incorrect'
      });
    }

    next();
  } catch (error) {
    console.error('PIN verification error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Check staff authentication (middleware for protected routes)
 */
export const checkStaffAuth = async (req, res, next) => {
  const pin = req.headers['x-staff-pin'];

  if (!pin) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Staff PIN is required in X-Staff-Pin header'
    });
  }

  try {
    const isValid = await Settings.verifyPin(pin);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid staff PIN'
      });
    }

    next();
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};
