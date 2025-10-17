/**
 * Controller layer for Route Plan operations
 * Handles HTTP requests and responses for route planning endpoints
 * Validates input, calls RoutePlanService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const RoutePlanService = require('../services/RoutePlanService')

class RoutePlanController {
  constructor() {
    this.routePlanService = new RoutePlanService()
  }

  /**
   * Get all route plans
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllRoutePlans(req, res) {
    try {
      const routePlans = await this.routePlanService.getAllRoutePlans()
      res.json(routePlans)
    } catch (error) {
      console.error('Error in getAllRoutePlans:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get a route plan by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoutePlanById(req, res) {
    try {
      const { id } = req.params
      const routePlan = await this.routePlanService.getRoutePlanById(id)
      res.json(routePlan)
    } catch (error) {
      console.error('Error in getRoutePlanById:', error)

      if (error.message === 'Route plan not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate a new route plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateRoutePlan(req, res) {
    try {
      const planData = req.body
      const routePlan = await this.routePlanService.generateRoutePlan(planData)
      res.status(201).json(routePlan)
    } catch (error) {
      console.error('Error in generateRoutePlan:', error)

      if (error.message.includes('No bins') || error.message.includes('No active trucks')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Approve a route plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async approveRoutePlan(req, res) {
    try {
      const { id } = req.params
      const routePlan = await this.routePlanService.approveRoutePlan(id)
      res.json(routePlan)
    } catch (error) {
      console.error('Error in approveRoutePlan:', error)

      if (error.message === 'Route plan not found') {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Dispatch a route plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async dispatchRoutePlan(req, res) {
    try {
      const { id } = req.params
      const routePlan = await this.routePlanService.dispatchRoutePlan(id)
      res.json(routePlan)
    } catch (error) {
      console.error('Error in dispatchRoutePlan:', error)

      if (error.message === 'Route plan not found' || error.message.includes('must be approved')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Complete a route plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async completeRoutePlan(req, res) {
    try {
      const { id } = req.params
      const routePlan = await this.routePlanService.completeRoutePlan(id)
      res.json(routePlan)
    } catch (error) {
      console.error('Error in completeRoutePlan:', error)

      if (error.message === 'Route plan not found' || error.message.includes('must be dispatched')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Delete a route plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteRoutePlan(req, res) {
    try {
      const { id } = req.params
      const routePlan = await this.routePlanService.deleteRoutePlan(id)
      res.json({ success: true, deletedRoutePlan: routePlan })
    } catch (error) {
      console.error('Error in deleteRoutePlan:', error)

      if (error.message === 'Route plan not found' || error.message.includes('Cannot delete')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get route plans by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoutePlansByStatus(req, res) {
    try {
      const { status } = req.params

      if (!status) {
        return res.status(400).json({ error: 'Status parameter is required' })
      }

      const validStatuses = ['planned', 'dispatched', 'in-progress', 'completed']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be planned, dispatched, in-progress, or completed' })
      }

      const routePlans = await this.routePlanService.getRoutePlansByStatus(status)
      res.json(routePlans)
    } catch (error) {
      console.error('Error in getRoutePlansByStatus:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get route plans by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoutePlansByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' })
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' })
      }

      if (start > end) {
        return res.status(400).json({ error: 'Start date must be before end date' })
      }

      const routePlans = await this.routePlanService.getRoutePlansByDateRange(start, end)
      res.json(routePlans)
    } catch (error) {
      console.error('Error in getRoutePlansByDateRange:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get route plan statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoutePlanStatistics(req, res) {
    try {
      const stats = await this.routePlanService.getRoutePlanStatistics()
      res.json(stats)
    } catch (error) {
      console.error('Error in getRoutePlanStatistics:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = RoutePlanController