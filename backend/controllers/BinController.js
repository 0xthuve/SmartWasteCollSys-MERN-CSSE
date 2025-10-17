/**
 * Controller layer for Bin operations
 * Handles HTTP requests and responses for bin-related endpoints
 * Validates input, calls BinService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const BaseController = require('./BaseController')
const BinService = require('../services/BinService')

class BinController extends BaseController {
  constructor(binService = null) {
    super()
    this.binService = binService || new BinService()
  }

  /**
   * Get all bins
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllBins(req, res) {
    try {
      const bins = await this.binService.getAllBinsWithStatus()
      res.json(bins)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get a bin by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBinById(req, res) {
    try {
      const { id } = req.params
      const bin = await this.binService.getBinByIdWithStatus(id)
      res.json(bin)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Create a new bin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBin(req, res) {
    try {
      const binData = req.body
      const bin = await this.binService.createBin(binData)
      res.status(201).json(bin)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Update a bin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBin(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      const bin = await this.binService.updateBin(id, updateData)
      res.json(bin)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Delete a bin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBin(req, res) {
    try {
      const { id } = req.params
      const bin = await this.binService.deleteBin(id)
      res.json({ success: true, deletedBin: bin })
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Report bin fill level from sensor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reportFillLevel(req, res) {
    try {
      const { sensorId, fillLevel } = req.body

      if (!sensorId || fillLevel === undefined) {
        return res.status(400).json({ error: 'Sensor ID and fill level are required' })
      }

      const bin = await this.binService.reportFillLevel(sensorId, fillLevel)
      res.json(bin)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get bins that need collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBinsNeedingCollection(req, res) {
    try {
      const bins = await this.binService.getBinsNeedingCollection()
      res.json(bins)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get priority bins (100% full)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPriorityBins(req, res) {
    try {
      const bins = await this.binService.getPriorityBins()
      res.json(bins)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Seed bins from data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async seedBins(req, res) {
    try {
      const binsData = req.body

      if (!Array.isArray(binsData) || binsData.length === 0) {
        return res.status(400).json({ error: 'Bins data array is required' })
      }

      const bins = await this.binService.seedBins(binsData)
      res.json({ message: `Successfully seeded ${bins.length} bins`, insertedCount: bins.length })
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get bin statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBinStatistics(req, res) {
    try {
      const stats = await this.binService.getBinStatistics()
      res.json(stats)
    } catch (error) {
      this.handleError(error, res)
    }
  }
}

module.exports = BinController