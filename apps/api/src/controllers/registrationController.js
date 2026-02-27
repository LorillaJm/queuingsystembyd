import { validationResult } from 'express-validator';
import Registration from '../models/firebase/Registration.js';
import Settings from '../models/firebase/Settings.js';
import Car from '../models/firebase/Car.js';
import { generateQueueNumber } from '../services/queueGenerator.js';

/**
 * Register new customer and generate queue number
 * POST /api/register
 */
export async function register(req, res) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { fullName, mobile, carId, model, branch, purpose = 'TEST_DRIVE' } = req.body;

    // Validate branch exists and is active
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    let modelId = null;
    let modelName = model;

    // If carId is provided, validate it and get model details
    if (carId) {
      // Find car and validate it's active
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(400).json({
          success: false,
          error: 'Invalid car',
          message: 'The selected car model does not exist'
        });
      }

      if (!car.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Inactive car',
          message: 'The selected car model is no longer available'
        });
      }

      if (car.branch !== branch.toUpperCase()) {
        return res.status(400).json({
          success: false,
          error: 'Branch mismatch',
          message: 'The selected car model is not available at this branch'
        });
      }

      modelId = car.id;
      modelName = car.model;
    } else if (model) {
      // If model name is provided without carId, try to find matching active car
      const cars = await Car.getActiveCars(branch);
      const car = cars.find(c => c.model.trim() === model.trim());

      if (car) {
        modelId = car.id;
        modelName = car.model;
      }
    }

    // Generate queue number (concurrency safe)
    const queueNo = await generateQueueNumber(branch);

    // Create registration
    const registration = await Registration.create({
      queueNo,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      model: modelName.trim(),
      modelId,
      branch: branch.toUpperCase(),
      purpose,
      status: 'WAITING'
    });

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('queue:updated', { branch: branch.toUpperCase() });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        ticketId: registration.id,
        queueNo: registration.queueNo,
        fullName: registration.fullName,
        model: registration.model,
        modelId: registration.modelId,
        branch: registration.branch,
        purpose: registration.purpose,
        status: registration.status,
        createdAt: registration.createdAt
      },
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error.message.includes('Maximum queue limit')) {
      return res.status(429).json({
        success: false,
        error: 'Queue limit reached',
        message: error.message
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate queue number',
        message: 'Queue number already exists. Please try again.'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'An error occurred while processing your registration'
    });
  }
}

/**
 * Get ticket information by ID
 * GET /api/ticket/:id
 */
export async function getTicket(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ticket ID',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }

    // Find ticket
    const ticket = await Registration.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with ID: ${id}`
      });
    }

    // Return ticket information
    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.id,
        queueNo: ticket.queueNo,
        fullName: ticket.fullName,
        mobile: ticket.mobile,
        model: ticket.model,
        branch: ticket.branch,
        purpose: ticket.purpose,
        status: ticket.status,
        calledAt: ticket.calledAt,
        completedAt: ticket.completedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve ticket',
      message: 'An error occurred while fetching ticket information'
    });
  }
}

/**
 * Get queue status for a branch
 * GET /api/queue?branch=MAIN
 */
export async function getQueue(req, res) {
  try {
    const { branch } = req.query;

    // Validate branch parameter
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

    const branchUpper = branch.toUpperCase();

    // Get all registrations for the branch
    const allRegistrations = await Registration.getQueueByBranch(branchUpper, ['SERVING', 'WAITING']);

    // Get current serving ticket
    const currentServing = allRegistrations.find(r => r.status === 'SERVING');

    // Get next 3 waiting tickets
    const nextUp = allRegistrations
      .filter(r => r.status === 'WAITING')
      .slice(0, 3);

    // Get total waiting count
    const waitingCount = allRegistrations.filter(r => r.status === 'WAITING').length;

    // Return queue status
    return res.status(200).json({
      success: true,
      data: {
        branch: branchUpper,
        currentServing: currentServing ? {
          queueNo: currentServing.queueNo,
          fullName: currentServing.fullName,
          status: currentServing.status,
          calledAt: currentServing.calledAt
        } : null,
        nextUp: nextUp.map(ticket => ({
          queueNo: ticket.queueNo,
          status: ticket.status
        })),
        waitingCount,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get queue error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve queue',
      message: 'An error occurred while fetching queue information'
    });
  }
}

/**
 * Get all active branches
 * GET /api/branches
 */
export async function getBranches(req, res) {
  try {
    const branches = await Settings.getActiveBranches();

    return res.status(200).json({
      success: true,
      data: {
        branches: branches.map(b => ({
          code: b.code,
          name: b.name,
          prefix: b.prefix
        }))
      }
    });

  } catch (error) {
    console.error('Get branches error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve branches',
      message: 'An error occurred while fetching branch information'
    });
  }
}

/**
 * Get active cars for a branch (public endpoint)
 * GET /api/cars?branch=MAIN
 */
export async function getPublicCars(req, res) {
  try {
    const { branch } = req.query;

    // Validate branch parameter
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
        message: `Branch '${branch}' does not exist or is not active'`
      });
    }

    // Get active cars sorted by displayOrder
    const cars = await Car.getActiveCars(branch);

    return res.status(200).json({
      success: true,
      data: {
        branch: branch.toUpperCase(),
        cars: cars.map(car => ({
          carId: car.id,
          model: car.model,
          displayOrder: car.displayOrder,
          imageUrl: car.imageUrl
        })),
        count: cars.length
      }
    });

  } catch (error) {
    console.error('Get public cars error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cars',
      message: 'An error occurred while fetching car models'
    });
  }
}


/**
 * Get all active registrations for MC/Display screens
 * GET /api/registrations?branch=MAIN
 */
export async function getPublicRegistrations(req, res) {
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

    // Get all active registrations (WAITING and SERVING)
    const registrations = await Registration.getQueueByBranch(branch, ['WAITING', 'SERVING']);

    return res.status(200).json({
      success: true,
      data: {
        branch: branch.toUpperCase(),
        registrations: registrations.map(r => ({
          ticketId: r.id,
          queueNo: r.queueNo,
          fullName: r.fullName,
          mobile: r.mobile,
          model: r.model,
          branch: r.branch,
          purpose: r.purpose,
          status: r.status,
          calledAt: r.calledAt,
          createdAt: r.createdAt
        })),
        count: registrations.length
      }
    });

  } catch (error) {
    console.error('Get public registrations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve registrations',
      message: 'An error occurred while fetching registrations'
    });
  }
}
