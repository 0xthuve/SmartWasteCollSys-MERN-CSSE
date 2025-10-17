/**
 * Controller layer for Truck operations
 * Handles HTTP requests and responses for truck-related endpoints
 * Validates input, calls TruckService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const TruckService = require('../services/TruckService')

class TruckController {
  constructor() {
    this.truckService = new TruckService()
  }

  /**
   * Get all trucks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTrucks(req, res) {
    try {
      const trucks = await this.truckService.getAllTrucks()
      res.json(trucks)
    } catch (error) {
      console.error('Error in getAllTrucks:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get a truck by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTruckById(req, res) {
    try {
      const { id } = req.params
      const truck = await this.truckService.getTruckById(id)
      res.json(truck)
    } catch (error) {
      console.error('Error in getTruckById:', error)

      if (error.message === 'Truck not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Create a new truck
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTruck(req, res) {
    try {
      const truckData = req.body
      const truck = await this.truckService.createTruck(truckData)
      res.status(201).json(truck)
    } catch (error) {
      console.error('Error in createTruck:', error)

      if (error.message.includes('already exists') || error.message.includes('required') || error.message.includes('must be')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Update a truck
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTruck(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      const truck = await this.truckService.updateTruck(id, updateData)
      res.json(truck)
    } catch (error) {
      console.error('Error in updateTruck:', error)

      if (error.message === 'Truck not found' || error.message.includes('already exists') || error.message.includes('must be')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Delete a truck
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTruck(req, res) {
    try {
      const { id } = req.params
      const truck = await this.truckService.deleteTruck(id)
      res.json({ success: true, deletedTruck: truck })
    } catch (error) {
      console.error('Error in deleteTruck:', error)

      if (error.message === 'Truck not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Update truck location
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTruckLocation(req, res) {
    try {
      const { id } = req.params
      const { currentLocation } = req.body

      if (!currentLocation) {
        return res.status(400).json({ error: 'Current location is required' })
      }

      const truck = await this.truckService.updateTruckLocation(id, currentLocation)
      res.json(truck)
    } catch (error) {
      console.error('Error in updateTruckLocation:', error)

      if (error.message === 'Truck not found' || error.message.includes('inactive truck') || error.message.includes('Valid location')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get active trucks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveTrucks(req, res) {
    try {
      const trucks = await this.truckService.getActiveTrucks()
      res.json(trucks)
    } catch (error) {
      console.error('Error in getActiveTrucks:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get trucks by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTrucksByStatus(req, res) {
    try {
      const { status } = req.params

      if (!status) {
        return res.status(400).json({ error: 'Status parameter is required' })
      }

      const validStatuses = ['Active', 'Inactive', 'Maintenance']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be Active, Inactive, or Maintenance' })
      }

      const trucks = await this.truckService.getTrucksByStatus(status)
      res.json(trucks)
    } catch (error) {
      console.error('Error in getTrucksByStatus:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get truck statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTruckStatistics(req, res) {
    try {
      const stats = await this.truckService.getTruckStatistics()
      res.json(stats)
    } catch (error) {
      console.error('Error in getTruckStatistics:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = TruckController