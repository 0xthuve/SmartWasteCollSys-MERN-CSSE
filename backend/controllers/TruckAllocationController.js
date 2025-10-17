/**
 * Controller for Truck Allocation operations
 * Handles HTTP requests for truck-to-bin allocation with fuel considerations
 * Validates input, calls service layer, and returns appropriate responses
 * Follows MVC pattern with separation of concerns
 */
const TruckAllocationService = require('../services/TruckAllocationService')

class TruckAllocationController {
  constructor() {
    this.truckAllocationService = new TruckAllocationService()
  }

  /**
   * Allocate trucks for collection based on bin IDs
   * POST /api/truck-allocation/allocate
   */
  async allocateTrucks(req, res) {
    try {
      const { binIds, options } = req.body

      // Validate required fields
      if (!binIds || !Array.isArray(binIds)) {
        return res.status(400).json({
          error: 'binIds array is required'
        })
      }

      const result = await this.truckAllocationService.allocateTrucksForBins(binIds, options || {})

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Truck allocation error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Get allocation recommendations for different scenarios
   * POST /api/truck-allocation/recommendations
   */
  async getAllocationRecommendations(req, res) {
    try {
      const { binIds, constraints } = req.body

      if (!binIds || !Array.isArray(binIds)) {
        return res.status(400).json({
          error: 'binIds array is required'
        })
      }

      const result = await this.truckAllocationService.getAllocationRecommendations(binIds, constraints || {})

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Allocation recommendations error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Validate truck fuel levels for a route
   * GET /api/truck-allocation/validate-fuel/:truckId
   */
  async validateTruckFuel(req, res) {
    try {
      const { truckId } = req.params
      const { estimatedDistance } = req.query

      if (!truckId) {
        return res.status(400).json({
          error: 'Truck ID is required'
        })
      }

      const distance = parseFloat(estimatedDistance) || 0
      const result = await this.truckAllocationService.validateTruckFuel(truckId, distance)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Fuel validation error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Get allocation statistics and insights
   * GET /api/truck-allocation/stats
   */
  async getAllocationStats(req, res) {
    try {
      // This would aggregate allocation data from recent operations
      // For now, return basic structure
      res.status(200).json({
        success: true,
        data: {
          totalAllocations: 0,
          averageEfficiency: 0,
          fuelSavings: 0,
          trucksUtilized: 0
        }
      })
    } catch (error) {
      console.error('Allocation stats error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = TruckAllocationController