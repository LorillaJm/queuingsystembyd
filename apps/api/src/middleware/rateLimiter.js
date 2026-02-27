import rateLimit from 'express-rate-limit';

export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const staffLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});
