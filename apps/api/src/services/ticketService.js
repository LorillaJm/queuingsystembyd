import Registration from '../models/firebase/Registration.js';
import { updateCurrentServing } from './queueGenerator.js';

/**
 * Ticket Service
 * 
 * Handles ticket state transitions with validation.
 * Ensures only valid transitions occur and maintains queue integrity.
 */

/**
 * Valid state transitions
 * 
 * WAITING → SERVING (call next or call specific)
 * SERVING → DONE (mark done)
 * SERVING → NOSHOW (mark no-show)
 * WAITING → NOSHOW (mark no-show without calling)
 * 
 * Invalid transitions (will be rejected):
 * DONE → any state
 * NOSHOW → any state
 */
const VALID_TRANSITIONS = {
  WAITING: ['SERVING', 'NOSHOW'],
  SERVING: ['DONE', 'NOSHOW'],
  DONE: [],
  NOSHOW: []
};

/**
 * Check if state transition is valid
 */
function isValidTransition(fromStatus, toStatus) {
  return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
}

/**
 * Call next waiting ticket for a specific model
 * Rule: Only one SERVING ticket per model at a time
 */
export async function callNextTicket(branch, model = null) {
  const branchUpper = branch.toUpperCase();

  if (model) {
    // Call next for specific model
    return callNextForModel(branchUpper, model);
  }

  // If no model specified, call next overall (legacy behavior)
  const waitingTickets = await Registration.getQueueByBranch(branchUpper, ['WAITING']);
  
  if (waitingTickets.length === 0) {
    throw new Error('NO_TICKETS_IN_QUEUE');
  }

  const nextTicket = waitingTickets[0];
  
  const updatedTicket = await Registration.update(nextTicket.id, {
    status: 'SERVING',
    calledAt: Date.now()
  });

  await updateCurrentServing(branchUpper, updatedTicket.queueNo);
  return updatedTicket;
}

/**
 * Call next ticket for a specific model
 */
async function callNextForModel(branch, model) {
  // Get all tickets for this model
  const allTickets = await Registration.getQueueByBranch(branch, ['WAITING', 'SERVING']);
  const modelTickets = allTickets.filter(t => t.model === model);
  
  // Check if there's already someone being served for this model
  const currentlyServing = modelTickets.find(t => t.status === 'SERVING');
  
  if (currentlyServing) {
    throw new Error('ALREADY_SERVING');
  }
  
  // Get waiting tickets for this model
  const waitingTickets = modelTickets.filter(t => t.status === 'WAITING');
  
  if (waitingTickets.length === 0) {
    throw new Error('NO_TICKETS_IN_QUEUE');
  }

  const nextTicket = waitingTickets[0];
  
  const updatedTicket = await Registration.update(nextTicket.id, {
    status: 'SERVING',
    calledAt: Date.now()
  });

  return updatedTicket;
}

/**
 * Call specific ticket by queue number
 * Rule: Only one SERVING ticket per branch at a time
 */
export async function callSpecificTicket(branch, queueNo) {
  const branchUpper = branch.toUpperCase();

  // Find the target ticket
  const targetTicket = await Registration.findByQueueNo(queueNo);

  if (!targetTicket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  if (targetTicket.branch !== branchUpper) {
    throw new Error('TICKET_NOT_FOUND');
  }

  // Check if transition is valid
  if (!isValidTransition(targetTicket.status, 'SERVING')) {
    throw new Error(`INVALID_TRANSITION: Cannot move ${targetTicket.status} to SERVING`);
  }

  // Step 1: Mark all other SERVING tickets as DONE
  const servingTickets = await Registration.getQueueByBranch(branchUpper, ['SERVING']);
  
  for (const ticket of servingTickets) {
    if (ticket.queueNo !== queueNo) {
      await Registration.update(ticket.id, {
        status: 'DONE',
        completedAt: Date.now()
      });
    }
  }

  // Step 2: Update target ticket to SERVING
  const updatedTicket = await Registration.update(targetTicket.id, {
    status: 'SERVING',
    calledAt: Date.now()
  });

  // Step 3: Update queue state
  await updateCurrentServing(branchUpper, queueNo);

  return updatedTicket;
}

/**
 * Mark ticket as done and auto-call next for the same model
 */
export async function markTicketDone(branch, queueNo) {
  const branchUpper = branch.toUpperCase();

  const ticket = await Registration.findByQueueNo(queueNo);

  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  if (ticket.branch !== branchUpper) {
    throw new Error('TICKET_NOT_FOUND');
  }

  if (!isValidTransition(ticket.status, 'DONE')) {
    throw new Error(`INVALID_TRANSITION: Cannot move ${ticket.status} to DONE`);
  }

  const model = ticket.model;

  const updatedTicket = await Registration.update(ticket.id, {
    status: 'DONE',
    completedAt: Date.now()
  });

  // Auto-call next customer for this model (without checking if already serving)
  try {
    // Get waiting tickets for this model
    const allTickets = await Registration.getQueueByBranch(branchUpper, ['WAITING']);
    const waitingTickets = allTickets.filter(t => t.model === model);
    
    if (waitingTickets.length > 0) {
      const nextTicket = waitingTickets[0];
      await Registration.update(nextTicket.id, {
        status: 'SERVING',
        calledAt: Date.now()
      });
      console.log(`Auto-called next customer ${nextTicket.queueNo} for ${model}`);
    }
  } catch (err) {
    // No more customers waiting for this model, that's okay
    console.log(`No more customers waiting for ${model}:`, err.message);
  }

  return updatedTicket;
}

/**
 * Mark ticket as no-show
 */
export async function markTicketNoShow(branch, queueNo) {
  const branchUpper = branch.toUpperCase();

  const ticket = await Registration.findByQueueNo(queueNo);

  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  if (ticket.branch !== branchUpper) {
    throw new Error('TICKET_NOT_FOUND');
  }

  // Check if transition is valid
  if (!isValidTransition(ticket.status, 'NOSHOW')) {
    throw new Error(`INVALID_TRANSITION: Cannot move ${ticket.status} to NOSHOW`);
  }

  const wasServing = ticket.status === 'SERVING';

  const updatedTicket = await Registration.update(ticket.id, {
    status: 'NOSHOW',
    completedAt: Date.now()
  });

  // If this was the serving ticket, clear current serving
  if (wasServing) {
    await updateCurrentServing(branchUpper, null);
  }

  return updatedTicket;
}

/**
 * Get current serving ticket for a branch
 */
export async function getCurrentServingTicket(branch) {
  const branchUpper = branch.toUpperCase();

  const servingTickets = await Registration.getQueueByBranch(branchUpper, ['SERVING']);
  return servingTickets.length > 0 ? servingTickets[0] : null;
}

/**
 * Get queue statistics for a branch
 */
export async function getQueueStatistics(branch) {
  const branchUpper = branch.toUpperCase();

  const [waiting, serving] = await Promise.all([
    Registration.countByStatus(branchUpper, 'WAITING'),
    Registration.countByStatus(branchUpper, 'SERVING')
  ]);

  const todayRegistrations = await Registration.getTodayRegistrations(branchUpper);
  const done = todayRegistrations.filter(r => r.status === 'DONE').length;
  const noshow = todayRegistrations.filter(r => r.status === 'NOSHOW').length;

  return {
    branch: branchUpper,
    waiting,
    serving,
    done,
    noshow,
    total: waiting + serving + done + noshow
  };
}

export default {
  callNextTicket,
  callSpecificTicket,
  markTicketDone,
  markTicketNoShow,
  getCurrentServingTicket,
  getQueueStatistics,
  isValidTransition
};
