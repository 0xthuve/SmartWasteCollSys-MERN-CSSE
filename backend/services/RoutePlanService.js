/**
 * Service layer for Route Plan operations
 * Contains business logic for route planning and optimization
 * Coordinates between RoutePlanDAO, BinService, TruckService, and RouteOptimizerService
 * Follows the Service pattern for separation of concerns
 */
const RoutePlanDAO = require('../daos/RoutePlanDAO')
const BinService = require('./BinService')
const TruckService = require('./TruckService')
const { RouteOptimizerService } = require('./RouteOptimizerService')

class RoutePlanService {
  constructor() {
    this.routePlanDAO = new RoutePlanDAO()
    this.binService = new BinService()
    this.truckService = new TruckService()
    this.routeOptimizer = new RouteOptimizerService()
  }

  /**
   * Get all route plans with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of route plan objects
   */
  async getAllRoutePlans(filter = {}, options = {}) {
    try {
      return await this.routePlanDAO.findAll(filter, {
        sort: { generatedFor: -1 },
        populate: [{ path: 'routes.truckId', select: 'plate model' }],
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to retrieve route plans: ${error.message}`)
    }
  }

  /**
   * Get a route plan by ID
   * @param {string} id - Route plan ID
   * @returns {Promise<Object|null>} Route plan object or null if not found
   */
  async getRoutePlanById(id) {
    try {
      const routePlan = await this.routePlanDAO.findById(id, {
        populate: [{ path: 'routes.truckId', select: 'plate model capacity' }]
      })
      if (!routePlan) {
        throw new Error('Route plan not found')
      }
      return routePlan
    } catch (error) {
      throw new Error(`Failed to retrieve route plan: ${error.message}`)
    }
  }

  /**
   * Generate a new route plan
   * @param {Object} planData - Route plan generation parameters
   * @returns {Promise<Object>} Generated route plan object
   */
  async generateRoutePlan(planData = {}) {
    try {
      const mode = planData.mode || 'real-time'
      const depotLocation = planData.depotLocation || 'Kilinochchi Town'

      // Get bins needing collection
      const bins = await this.binService.getAllBinsWithStatus()
      const binsNeedingCollection = bins.filter(bin => bin.fillLevel > 70)

      if (binsNeedingCollection.length === 0) {
        throw new Error('No bins currently need collection')
      }

      // Get active trucks
      const trucks = await this.truckService.getActiveTrucks()

      if (trucks.length === 0) {
        throw new Error('No active trucks available')
      }

      // Generate optimized routes
      const routes = this.routeOptimizer.optimizeMultiRoute(
        binsNeedingCollection,
        trucks,
        depotLocation
      )

      if (routes.length === 0) {
        throw new Error('Unable to generate routes with current bins and trucks')
      }

      // Calculate efficiency metrics
      const efficiency = this.routeOptimizer.calculateEfficiency(routes)

      // Create route plan
      const routePlanData = {
        mode,
        generatedFor: new Date(),
        routes,
        efficiency
      }

      return await this.routePlanDAO.create(routePlanData)
    } catch (error) {
      throw new Error(`Failed to generate route plan: ${error.message}`)
    }
  }

  /**
   * Approve a route plan
   * @param {string} id - Route plan ID
   * @returns {Promise<Object>} Approved route plan object
   */
  async approveRoutePlan(id) {
    try {
      const routePlan = await this.routePlanDAO.findById(id)
      if (!routePlan) {
        throw new Error('Route plan not found')
      }

      // If already approved, return the existing approved plan
      if (routePlan.approved) {
        return routePlan
      }

      return await this.routePlanDAO.approve(id)
    } catch (error) {
      throw new Error(`Failed to approve route plan: ${error.message}`)
    }
  }

  /**
   * Dispatch a route plan
   * @param {string} id - Route plan ID
   * @returns {Promise<Object>} Dispatched route plan object
   */
  async dispatchRoutePlan(id) {
    try {
      const routePlan = await this.routePlanDAO.findById(id)
      if (!routePlan) {
        throw new Error('Route plan not found')
      }

      if (!routePlan.approved) {
        throw new Error('Route plan must be approved before dispatching')
      }

      // If already dispatched, return the existing dispatched plan
      if (routePlan.status === 'dispatched') {
        return routePlan
      }

      return await this.routePlanDAO.dispatch(id)
    } catch (error) {
      throw new Error(`Failed to dispatch route plan: ${error.message}`)
    }
  }

  /**
   * Complete a route plan
   * @param {string} id - Route plan ID
   * @returns {Promise<Object>} Completed route plan object
   */
  async completeRoutePlan(id) {
    try {
      const routePlan = await this.routePlanDAO.findById(id)
      if (!routePlan) {
        throw new Error('Route plan not found')
      }

      if (routePlan.status !== 'dispatched') {
        throw new Error('Route plan must be dispatched before completing')
      }

      return await this.routePlanDAO.complete(id)
    } catch (error) {
      throw new Error(`Failed to complete route plan: ${error.message}`)
    }
  }

  /**
   * Delete a route plan
   * @param {string} id - Route plan ID
   * @returns {Promise<Object>} Deleted route plan object
   */
  async deleteRoutePlan(id) {
    try {
      const routePlan = await this.routePlanDAO.findById(id)
      if (!routePlan) {
        throw new Error('Route plan not found')
      }

      // Don't allow deletion of dispatched or completed plans
      if (routePlan.status === 'dispatched' || routePlan.status === 'completed') {
        throw new Error('Cannot delete dispatched or completed route plans')
      }

      const deletedPlan = await this.routePlanDAO.deleteById(id)
      if (!deletedPlan) {
        throw new Error('Route plan not found')
      }
      return deletedPlan
    } catch (error) {
      throw new Error(`Failed to delete route plan: ${error.message}`)
    }
  }

  /**
   * Get route plans by status
   * @param {string} status - Route plan status
   * @returns {Promise<Array>} Array of route plans with the specified status
   */
  async getRoutePlansByStatus(status) {
    try {
      return await this.routePlanDAO.findByStatus(status, {
        populate: [{ path: 'routes.truckId', select: 'plate model' }]
      })
    } catch (error) {
      throw new Error(`Failed to get route plans by status: ${error.message}`)
    }
  }

  /**
   * Get route plans by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of route plans within the date range
   */
  async getRoutePlansByDateRange(startDate, endDate) {
    try {
      return await this.routePlanDAO.findByDateRange(startDate, endDate, {
        populate: [{ path: 'routes.truckId', select: 'plate model' }]
      })
    } catch (error) {
      throw new Error(`Failed to get route plans by date range: ${error.message}`)
    }
  }

  /**
   * Get route plan statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getRoutePlanStatistics() {
    try {
      const totalPlans = await this.routePlanDAO.count()
      const plannedPlans = await this.routePlanDAO.count({ status: 'planned' })
      const dispatchedPlans = await this.routePlanDAO.count({ status: 'dispatched' })
      const completedPlans = await this.routePlanDAO.count({ status: 'completed' })
      const approvedPlans = await this.routePlanDAO.count({ approved: true })

      return {
        total: totalPlans,
        planned: plannedPlans,
        dispatched: dispatchedPlans,
        completed: completedPlans,
        approved: approvedPlans
      }
    } catch (error) {
      throw new Error(`Failed to get route plan statistics: ${error.message}`)
    }
  }
}

module.exports = RoutePlanService