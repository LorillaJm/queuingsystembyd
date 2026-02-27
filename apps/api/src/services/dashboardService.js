import Car from '../models/Car.js';
import Registration from '../models/firebase/Registration.js';
import Settings from '../models/firebase/Settings.js';

/**
 * Get dashboard data for a branch
 * Shows all active cars with registration counts (even if 0)
 * 
 * @param {string} branch - Branch code
 * @returns {Promise<Object>} Dashboard data with models array
 */
export async function getDashboardData(branch) {
  // Validate branch exists
  const branchExists = await Settings.isBranchValid(branch);
  if (!branchExists) {
    throw new Error(`Branch '${branch}' does not exist or is not active`);
  }

  const branchUpper = branch.toUpperCase();

  // 1. Fetch all active cars for the branch (sorted by displayOrder)
  const activeCars = await Car.getActiveCars(branchUpper);

  // 2. Aggregate registrations by modelId and status
  const registrationStats = await Registration.aggregate([
    {
      $match: {
        branch: branchUpper,
        status: { $in: ['WAITING', 'SERVING', 'DONE'] },
        modelId: { $ne: null } // Only count registrations with modelId
      }
    },
    {
      $group: {
        _id: {
          modelId: '$modelId',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // 3. Get next queue numbers for WAITING tickets per model
  const waitingTickets = await Registration.find({
    branch: branchUpper,
    status: 'WAITING',
    modelId: { $ne: null }
  })
    .sort({ createdAt: 1 })
    .select('modelId queueNo')
    .lean();

  // Group waiting tickets by modelId
  const nextQueueByModel = {};
  waitingTickets.forEach(ticket => {
    const modelIdStr = ticket.modelId.toString();
    if (!nextQueueByModel[modelIdStr]) {
      nextQueueByModel[modelIdStr] = [];
    }
    // Store up to 3 next queue numbers
    if (nextQueueByModel[modelIdStr].length < 3) {
      nextQueueByModel[modelIdStr].push(ticket.queueNo);
    }
  });

  // 4. Create a map of registration stats by modelId
  const statsMap = {};
  registrationStats.forEach(stat => {
    const modelIdStr = stat._id.modelId.toString();
    if (!statsMap[modelIdStr]) {
      statsMap[modelIdStr] = {
        serving: 0,
        waiting: 0,
        done: 0
      };
    }
    statsMap[modelIdStr][stat._id.status.toLowerCase()] = stat.count;
  });

  // 5. Merge active cars with stats (ensure all cars show even with 0 counts)
  const models = activeCars.map(car => {
    const carIdStr = car._id.toString();
    const stats = statsMap[carIdStr] || { serving: 0, waiting: 0, done: 0 };
    const nextQueueNos = nextQueueByModel[carIdStr] || [];

    return {
      carId: car._id,
      model: car.model,
      capacity: car.capacity,
      displayOrder: car.displayOrder,
      imageUrl: car.imageUrl,
      serving: stats.serving || 0,
      waiting: stats.waiting || 0,
      done: stats.done || 0,
      nextQueueNos
    };
  });

  // Calculate totals
  const totals = models.reduce((acc, model) => ({
    serving: acc.serving + model.serving,
    waiting: acc.waiting + model.waiting,
    done: acc.done + model.done
  }), { serving: 0, waiting: 0, done: 0 });

  return {
    branch: branchUpper,
    models,
    totals,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get dashboard summary for all branches
 * @returns {Promise<Array>} Array of branch summaries
 */
export async function getAllBranchesSummary() {
  const branches = await Settings.getActiveBranches();
  
  const summaries = await Promise.all(
    branches.map(async (branch) => {
      try {
        const data = await getDashboardData(branch.code);
        return {
          branch: branch.code,
          branchName: branch.name,
          ...data.totals
        };
      } catch (error) {
        console.error(`Error getting summary for branch ${branch.code}:`, error);
        return {
          branch: branch.code,
          branchName: branch.name,
          serving: 0,
          waiting: 0,
          done: 0,
          error: error.message
        };
      }
    })
  );

  return summaries;
}

export default {
  getDashboardData,
  getAllBranchesSummary
};
