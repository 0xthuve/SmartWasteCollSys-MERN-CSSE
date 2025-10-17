/**
 * Controller layer for Collection operations
 * Handles HTTP requests and responses for collection-related endpoints
 * Validates input, calls CollectionService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const CollectionService = require('../services/CollectionService')

class CollectionController {
  constructor() {
    this.collectionService = new CollectionService()
  }

  /**
   * Get all collections
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCollections(req, res) {
    try {
      const collections = await this.collectionService.getAllCollections()
      res.json(collections)
    } catch (error) {
      console.error('Error in getAllCollections:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get a collection by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCollectionById(req, res) {
    try {
      const { id } = req.params
      const collection = await this.collectionService.getCollectionById(id)
      res.json(collection)
    } catch (error) {
      console.error('Error in getCollectionById:', error)

      if (error.message === 'Collection not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Create a new collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCollection(req, res) {
    try {
      const collectionData = req.body
      const userId = req.user.id

      const collection = await this.collectionService.createCollection(collectionData, userId)
      res.status(201).json(collection)
    } catch (error) {
      console.error('Error in createCollection:', error)

      if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('inactive truck')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Update a collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCollection(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      const collection = await this.collectionService.updateCollection(id, updateData)
      res.json(collection)
    } catch (error) {
      console.error('Error in updateCollection:', error)

      if (error.message === 'Collection not found' || error.message.includes('must be') || error.message.includes('inactive truck')) {
        return res.status(400).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Delete a collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCollection(req, res) {
    try {
      const { id } = req.params
      const collection = await this.collectionService.deleteCollection(id)
      res.json({ success: true, deletedCollection: collection })
    } catch (error) {
      console.error('Error in deleteCollection:', error)

      if (error.message === 'Collection not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get collections by truck
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCollectionsByTruck(req, res) {
    try {
      const { truckId } = req.params
      const collections = await this.collectionService.getCollectionsByTruck(truckId)
      res.json(collections)
    } catch (error) {
      console.error('Error in getCollectionsByTruck:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get collections by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCollectionsByDateRange(req, res) {
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

      const collections = await this.collectionService.getCollectionsByDateRange(start, end)
      res.json(collections)
    } catch (error) {
      console.error('Error in getCollectionsByDateRange:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get collection statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCollectionStatistics(req, res) {
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

      const stats = await this.collectionService.getCollectionStatistics(start, end)
      res.json(stats)
    } catch (error) {
      console.error('Error in getCollectionStatistics:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get dashboard summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardSummary(req, res) {
    try {
      const { days } = req.query
      const daysNum = days ? parseInt(days) : 30

      if (daysNum < 1 || daysNum > 365) {
        return res.status(400).json({ error: 'Days must be between 1 and 365' })
      }

      const summary = await this.collectionService.getDashboardSummary(daysNum)
      res.json(summary)
    } catch (error) {
      console.error('Error in getDashboardSummary:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get collections by bin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCollectionsByBin(req, res) {
    try {
      const { binId } = req.params
      const collections = await this.collectionService.getCollectionsByBin(binId)
      res.json(collections)
    } catch (error) {
      console.error('Error in getCollectionsByBin:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = CollectionController