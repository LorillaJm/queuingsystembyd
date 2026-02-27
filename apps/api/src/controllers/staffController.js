import { validationResult } from 'express-validator';
import Registration from '../models/firebase/Registration.js';
import Settings from '../models/firebase/Settings.js';
import {
  callNextTicket,
  callSpecificTicket,
  markTicketDone,
  markTicketNoShow,
  getQueueStatistics
} from '../services/ticketService.js';

/**
 * Verify staff PIN
 * POST /api/staff/auth
 */
export async function verifyPin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { pin } = req.body;
    const isValid = await Settings.verifyPin(pin);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid PIN',
        message: 'The provided PIN is incorrect'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Get all active tickets for staff view
 * GET /api/staff/tickets?branch=MAIN
 */
export async function getTickets(req, res) {
  try {
    const { branch } = req.query;

    if (branch) {
      // Validate branch exists
      const branchExists = await Settings.isBranchValid(branch);
      if (!branchExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid branch',
          message: `Branch '${branch}' does not exist or is not active`
        });
      }
    }

    // Get tickets using Firebase model
    const tickets = branch 
      ? await Registration.getQueueByBranch(branch, ['WAITING', 'SERVING'])
      : await Registration.getQueueByBranch('MAIN', ['WAITING', 'SERVING']); // Default to MAIN if no branch

    return res.status(200).json({
      success: true,
      data: {
        tickets: tickets.map(t => ({
          ticketId: t.id,
          queueNo: t.queueNo,
          fullName: t.fullName,
          mobile: t.mobile,
          model: t.model,
          branch: t.branch,
          purpose: t.purpose,
          status: t.status,
          calledAt: t.calledAt,
          createdAt: t.createdAt
        })),
        count: tickets.length
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tickets',
      message: 'An error occurred while fetching tickets'
    });
  }
}

/**
 * Call next waiting ticket
 * POST /api/staff/next
 */
export async function next(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { branch } = req.body;

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    // Call next ticket using service
    const ticket = await callNextTicket(branch);

    // Emit socket events
    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
      req.io.emit('ticket:called', {
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        branch: ticket.branch
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        status: ticket.status,
        calledAt: ticket.calledAt
      },
      message: 'Next ticket called successfully'
    });

  } catch (error) {
    console.error('Call next error:', error);

    if (error.message === 'NO_TICKETS_IN_QUEUE') {
      return res.status(404).json({
        success: false,
        error: 'No tickets in queue',
        message: 'There are no waiting tickets to call'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to call next ticket',
      message: 'An error occurred while calling the next ticket'
    });
  }
}

/**
 * Call specific ticket by queue number
 * POST /api/staff/call
 */
export async function call(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { branch, queueNo } = req.body;

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    // Call specific ticket using service
    const ticket = await callSpecificTicket(branch, queueNo);

    // Emit socket events
    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
      req.io.emit('ticket:called', {
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        branch: ticket.branch
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        status: ticket.status,
        calledAt: ticket.calledAt
      },
      message: 'Ticket called successfully'
    });

  } catch (error) {
    console.error('Call specific error:', error);

    if (error.message === 'TICKET_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with queue number: ${req.body.queueNo}`
      });
    }

    if (error.message.startsWith('INVALID_TRANSITION')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state transition',
        message: error.message.replace('INVALID_TRANSITION: ', '')
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to call ticket',
      message: 'An error occurred while calling the ticket'
    });
  }
}

/**
 * Mark ticket as done
 * POST /api/staff/mark-done
 */
export async function markDone(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { branch, queueNo } = req.body;

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    // Mark ticket as done using service
    const ticket = await markTicketDone(branch, queueNo);

    // Emit socket event
    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        status: ticket.status,
        completedAt: ticket.completedAt
      },
      message: 'Ticket marked as done'
    });

  } catch (error) {
    console.error('Mark done error:', error);

    if (error.message === 'TICKET_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with queue number: ${req.body.queueNo}`
      });
    }

    if (error.message.startsWith('INVALID_TRANSITION')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state transition',
        message: error.message.replace('INVALID_TRANSITION: ', '')
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to mark ticket as done',
      message: 'An error occurred while updating the ticket'
    });
  }
}

/**
 * Mark ticket as no-show
 * POST /api/staff/no-show
 */
export async function noShow(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { branch, queueNo } = req.body;

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    // Mark ticket as no-show using service
    const ticket = await markTicketNoShow(branch, queueNo);

    // Emit socket event
    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        status: ticket.status,
        completedAt: ticket.completedAt
      },
      message: 'Ticket marked as no-show'
    });

  } catch (error) {
    console.error('Mark no-show error:', error);

    if (error.message === 'TICKET_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with queue number: ${req.body.queueNo}`
      });
    }

    if (error.message.startsWith('INVALID_TRANSITION')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state transition',
        message: error.message.replace('INVALID_TRANSITION: ', '')
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to mark ticket as no-show',
      message: 'An error occurred while updating the ticket'
    });
  }
}

/**
 * Get queue statistics
 * GET /api/staff/stats?branch=MAIN
 */
export async function getStats(req, res) {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        error: 'Missing branch parameter',
        message: 'Branch parameter is required'
      });
    }

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    const stats = await getQueueStatistics(branch);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: 'An error occurred while fetching statistics'
    });
  }
}


/**
 * Call next ticket for a specific model
 * POST /api/staff/next-model
 */
export async function nextModel(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { branch, model } = req.body;

    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    const ticket = await callNextTicket(branch, model);

    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
      req.io.emit('ticket:called', {
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        branch: ticket.branch,
        model: ticket.model
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        model: ticket.model,
        status: ticket.status,
        calledAt: ticket.calledAt
      },
      message: 'Next ticket called for ' + model
    });

  } catch (error) {
    console.error('Call next model error:', error);

    if (error.message === 'NO_TICKETS_IN_QUEUE') {
      return res.status(404).json({
        success: false,
        error: 'No tickets in queue',
        message: 'There are no waiting tickets for this model'
      });
    }

    if (error.message === 'ALREADY_SERVING') {
      return res.status(400).json({
        success: false,
        error: 'Already serving',
        message: 'Please complete the current customer before calling the next one'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to call next ticket',
      message: 'An error occurred while calling the next ticket'
    });
  }
}
