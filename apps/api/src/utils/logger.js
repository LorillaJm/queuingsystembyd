/**
 * Simple logger utility
 * In production, consider using winston or pino
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const shouldLog = (level) => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' && level === LOG_LEVELS.DEBUG) {
    return false;
  }
  return true;
};

const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  });
};

export const logger = {
  error: (message, meta) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
    }
  },

  warn: (message, meta) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  },

  info: (message, meta) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  },

  debug: (message, meta) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
};

export default logger;
