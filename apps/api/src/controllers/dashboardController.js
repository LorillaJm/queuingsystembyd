import { getDashboardData, getAllBranchesSummary } from '../services/dashboardService.js';

/**
 * Get dashboard data for a branch
 * GET /api/dashboard?branch=MAIN
 */
export async function getDashboard(req, res) {
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

    // Get dashboard data
    const data = await getDashboardData(branch);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get dashboard error:', error);

    // Handle specific errors
    if (error.message.includes('does not exist')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid branch',
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard',
      message: 'An error occurred while fetching dashboard data'
    });
  }
}

/**
 * Get summary for all branches
 * GET /api/dashboard/summary
 */
export async function getDashboardSummary(req, res) {
  try {
    const summaries = await getAllBranchesSummary();

    return res.status(200).json({
      success: true,
      data: {
        branches: summaries,
        totalBranches: summaries.length
      }
    });

  } catch (error) {
    console.error('Get dashboard summary error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard summary',
      message: 'An error occurred while fetching dashboard summary'
    });
  }
}
