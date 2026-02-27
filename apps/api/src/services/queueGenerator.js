import QueueState from '../models/firebase/QueueState.js';
import Settings from '../models/firebase/Settings.js';

/**
 * Queue Number Generator Service
 * 
 * Generates unique queue numbers per branch per day with concurrency safety.
 * 
 * Format: {BRANCH_PREFIX}-{NNN}
 * Example: A-001, A-002, B-001, etc.
 * 
 * CONCURRENCY SAFETY:
 * Uses MongoDB's atomic findOneAndUpdate with $inc operator.
 * This ensures that even with multiple simultaneous requests,
 * each request gets a unique sequential number without duplicates.
 * 
 * How it works:
 * 1. MongoDB locks the document during the update operation
 * 2. $inc atomically increments the lastNumber field
 * 3. Each concurrent request waits its turn and gets the next number
 * 4. The operation is atomic at the database level, preventing race conditions
 * 
 * Example scenario with 3 concurrent requests:
 * - Request A: Reads lastNumber=5, increments to 6, returns 6
 * - Request B: Waits, reads lastNumber=6, increments to 7, returns 7
 * - Request C: Waits, reads lastNumber=7, increments to 8, returns 8
 * 
 * No two requests will ever get the same number.
 */

/**
 * Generate next queue number for a branch
 * @param {string} branchCode - Branch code (e.g., 'MAIN', 'NORTH')
 * @returns {Promise<string>} Queue number (e.g., 'A-001')
 * @throws {Error} If branch is invalid or max queue reached
 */
export async function generateQueueNumber(branchCode) {
  // Validate branch exists and is active
  const branch = await Settings.getBranch(branchCode);
  if (!branch) {
    throw new Error(`Invalid or inactive branch: ${branchCode}`);
  }

  // Get settings for max queue validation
  const settings = await Settings.getSettings();

  // Atomically get next number (concurrency safe)
  const nextNumber = await QueueState.getNextNumber(branchCode);

  // Check if max queue per day reached
  if (nextNumber > settings.maxQueuePerDay) {
    throw new Error(`Maximum queue limit (${settings.maxQueuePerDay}) reached for today`);
  }

  // Format queue number: PREFIX-NNN (e.g., A-001)
  const queueNo = formatQueueNumber(branch.prefix, nextNumber);

  return queueNo;
}

/**
 * Format queue number with branch prefix and padded number
 * @param {string} prefix - Branch prefix (e.g., 'A', 'B')
 * @param {number} number - Sequential number
 * @returns {string} Formatted queue number (e.g., 'A-001')
 */
export function formatQueueNumber(prefix, number) {
  // Pad number to 3 digits (001, 002, ..., 999)
  const paddedNumber = String(number).padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Parse queue number to extract prefix and number
 * @param {string} queueNo - Queue number (e.g., 'A-001')
 * @returns {Object} { prefix: 'A', number: 1 }
 */
export function parseQueueNumber(queueNo) {
  const match = queueNo.match(/^([A-Z]+)-(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid queue number format: ${queueNo}`);
  }
  return {
    prefix: match[1],
    number: parseInt(match[2], 10)
  };
}

/**
 * Get current queue state for a branch
 * @param {string} branchCode - Branch code
 * @returns {Promise<Object>} Queue state
 */
export async function getQueueState(branchCode) {
  const state = await QueueState.getOrCreateTodayState(branchCode);
  return {
    branch: state.branch,
    dateKey: state.dateKey,
    lastNumber: state.lastNumber,
    currentServingQueueNo: state.currentServingQueueNo,
    nextQueueNo: formatQueueNumber(
      (await Settings.getBranch(branchCode)).prefix,
      state.lastNumber + 1
    )
  };
}

/**
 * Update current serving queue number
 * @param {string} branchCode - Branch code
 * @param {string} queueNo - Queue number being served
 * @returns {Promise<Object>} Updated state
 */
export async function updateCurrentServing(branchCode, queueNo) {
  return await QueueState.updateCurrentServing(branchCode, queueNo);
}

/**
 * Get current serving queue number
 * @param {string} branchCode - Branch code
 * @returns {Promise<string|null>} Current serving queue number
 */
export async function getCurrentServing(branchCode) {
  return await QueueState.getCurrentServing(branchCode);
}

/**
 * Reset queue for a branch (admin function)
 * @param {string} branchCode - Branch code
 * @returns {Promise<void>}
 */
export async function resetQueue(branchCode) {
  const dateKey = new Date().toISOString().split('T')[0];
  await QueueState.findOneAndUpdate(
    { branch: branchCode.toUpperCase(), dateKey },
    { lastNumber: 0, currentServingQueueNo: null },
    { upsert: true }
  );
}

/**
 * Get queue statistics for a branch
 * @param {string} branchCode - Branch code
 * @returns {Promise<Object>} Statistics
 */
export async function getQueueStats(branchCode) {
  const state = await QueueState.getOrCreateTodayState(branchCode);
  const settings = await Settings.getSettings();
  
  return {
    branch: state.branch,
    dateKey: state.dateKey,
    totalGenerated: state.lastNumber,
    maxAllowed: settings.maxQueuePerDay,
    remaining: settings.maxQueuePerDay - state.lastNumber,
    currentServing: state.currentServingQueueNo,
    percentageFull: ((state.lastNumber / settings.maxQueuePerDay) * 100).toFixed(2)
  };
}

export default {
  generateQueueNumber,
  formatQueueNumber,
  parseQueueNumber,
  getQueueState,
  updateCurrentServing,
  getCurrentServing,
  resetQueue,
  getQueueStats
};
