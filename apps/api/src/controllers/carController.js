import { validationResult } from 'express-validator';
import Car from '../models/firebase/Car.js';
import Settings from '../models/firebase/Settings.js';

/**
 * Create new car/model
 * POST /api/staff/cars
 */
export async function createCar(req, res) {
  try {
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

    const { branch, model, capacity = 1, displayOrder = 1, imageUrl } = req.body;

    // Validate branch exists
    const branchExists = await Settings.isBranchValid(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: `Branch '${branch}' does not exist or is not active`
      });
    }

    // Check if model already exists for this branch
    const modelExists = await Car.modelExists(branch, model);
    if (modelExists) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate model',
        message: `Model '${model}' already exists for branch '${branch}'`
      });
    }

    // Create car
    const car = await Car.create({
      branch: branch.toUpperCase(),
      model: model.trim(),
      capacity,
      displayOrder,
      imageUrl: imageUrl || null,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      data: {
        carId: car._id,
        branch: car.branch,
        model: car.model,
        capacity: car.capacity,
        displayOrder: car.displayOrder,
        imageUrl: car.imageUrl,
        isActive: car.isActive,
        createdAt: car.createdAt
      },
      message: 'Car model created successfully'
    });

  } catch (error) {
    console.error('Create car error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate model',
        message: 'This model already exists for the specified branch'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create car',
      message: 'An error occurred while creating the car model'
    });
  }
}

/**
 * Update car/model
 * PATCH /api/staff/cars/:id
 */
export async function updateCar(req, res) {
  try {
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

    const { id } = req.params;
    const { model, capacity, displayOrder, imageUrl, isActive } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Car ID must be a valid MongoDB ObjectId'
      });
    }

    // Find car
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with ID: ${id}`
      });
    }

    // If model is being changed, check for duplicates
    if (model && model.trim() !== car.model) {
      const modelExists = await Car.modelExists(car.branch, model, id);
      if (modelExists) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate model',
          message: `Model '${model}' already exists for branch '${car.branch}'`
        });
      }
      car.model = model.trim();
    }

    // Update fields if provided
    if (capacity !== undefined) car.capacity = capacity;
    if (displayOrder !== undefined) car.displayOrder = displayOrder;
    if (imageUrl !== undefined) car.imageUrl = imageUrl || null;
    if (isActive !== undefined) car.isActive = isActive;

    await car.save();

    return res.status(200).json({
      success: true,
      data: {
        carId: car._id,
        branch: car.branch,
        model: car.model,
        capacity: car.capacity,
        displayOrder: car.displayOrder,
        imageUrl: car.imageUrl,
        isActive: car.isActive,
        updatedAt: car.updatedAt
      },
      message: 'Car model updated successfully'
    });

  } catch (error) {
    console.error('Update car error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate model',
        message: 'This model already exists for the specified branch'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update car',
      message: 'An error occurred while updating the car model'
    });
  }
}

/**
 * Get cars for a branch
 * GET /api/staff/cars?branch=MAIN&includeInactive=false
 */
export async function getCars(req, res) {
  try {
    const { branch, includeInactive } = req.query;

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

    // Get cars
    const cars = includeInactive === 'true'
      ? await Car.getAllCars(branch)
      : await Car.getActiveCars(branch);

    return res.status(200).json({
      success: true,
      data: {
        branch: branch.toUpperCase(),
        cars: cars.map(car => ({
          carId: car._id,
          model: car.model,
          capacity: car.capacity,
          displayOrder: car.displayOrder,
          imageUrl: car.imageUrl,
          isActive: car.isActive,
          createdAt: car.createdAt,
          updatedAt: car.updatedAt
        })),
        count: cars.length
      }
    });

  } catch (error) {
    console.error('Get cars error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cars',
      message: 'An error occurred while fetching car models'
    });
  }
}

/**
 * Toggle car active status
 * PATCH /api/staff/cars/:id/toggle
 */
export async function toggleCarActive(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Car ID must be a valid MongoDB ObjectId'
      });
    }

    // Find car
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with ID: ${id}`
      });
    }

    // Toggle active status
    await car.toggleActive();

    return res.status(200).json({
      success: true,
      data: {
        carId: car._id,
        model: car.model,
        isActive: car.isActive,
        updatedAt: car.updatedAt
      },
      message: `Car model ${car.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle car error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle car status',
      message: 'An error occurred while toggling car status'
    });
  }
}

/**
 * Delete car (soft delete by setting isActive to false)
 * DELETE /api/staff/cars/:id
 */
export async function deleteCar(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Car ID must be a valid MongoDB ObjectId'
      });
    }

    // Find and delete car
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        carId: car._id,
        model: car.model
      },
      message: 'Car model deleted successfully'
    });

  } catch (error) {
    console.error('Delete car error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete car',
      message: 'An error occurred while deleting the car model'
    });
  }
}
