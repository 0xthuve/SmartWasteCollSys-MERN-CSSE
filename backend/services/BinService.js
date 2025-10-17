/**
 * Service layer for Bin operations
 * Contains business logic for waste bin management
 * Coordinates between BinDAO and other services
 * Follows the Service pattern for separation of concerns
 */
const BinDAO = require('../daos/BinDAO')

class BinService {
  constructor() {
    this.binDAO = new BinDAO()
  }

  /**
   * Get all bins with calculated status
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of bin objects with calculated status
   */
  async getAllBinsWithStatus(filter = {}, options = {}) {
    try {
      const bins = await this.binDAO.findAll(filter, { sort: { createdAt: -1 }, ...options })
      return bins.map(bin => ({
        ...bin.toObject(),
        status: this.calculateStatus(bin.fillLevel)
      }))
    } catch (error) {
      throw new Error(`Failed to retrieve bins with status: ${error.message}`)
    }
  }

  /**
   * Get a bin by ID with calculated status
   * @param {string} id - Bin ID
   * @returns {Promise<Object|null>} Bin object with calculated status or null if not found
   */
  async getBinByIdWithStatus(id) {
    try {
      const bin = await this.binDAO.findById(id)
      if (!bin) {
        throw new Error('Bin not found')
      }
      return {
        ...bin.toObject(),
        status: this.calculateStatus(bin.fillLevel)
      }
    } catch (error) {
      throw new Error(`Failed to retrieve bin: ${error.message}`)
    }
  }

  /**
   * Get a bin by sensor ID
   * @param {string} sensorId - Sensor ID
   * @returns {Promise<Object|null>} Bin object or null if not found
   */
  async getBinBySensorId(sensorId) {
    try {
      const bin = await this.binDAO.findBySensorId(sensorId)
      if (!bin) {
        throw new Error('Bin not found')
      }
      return bin
    } catch (error) {
      throw new Error(`Failed to retrieve bin by sensor ID: ${error.message}`)
    }
  }

  /**
   * Create a new bin
   * @param {Object} binData - Bin data
   * @returns {Promise<Object>} Created bin object
   */
  async createBin(binData) {
    try {
      // Validate required fields
      this.validateBinData(binData)

      // Check if sensor ID already exists
      const existingBin = await this.binDAO.findBySensorId(binData.sensorId)
      if (existingBin) {
        throw new Error('Bin with this sensor ID already exists')
      }

      // Set default values
      const binToCreate = {
        ...binData,
        fillLevel: binData.fillLevel || 0,
        lastSeenAt: new Date()
      }

      return await this.binDAO.create(binToCreate)
    } catch (error) {
      throw new Error(`Failed to create bin: ${error.message}`)
    }
  }

  /**
   * Update a bin
   * @param {string} id - Bin ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated bin object
   */
  async updateBin(id, updateData) {
    try {
      // Validate the bin exists
      const existingBin = await this.binDAO.findById(id)
      if (!existingBin) {
        throw new Error('Bin not found')
      }

      // If sensorId is being updated, check for uniqueness
      if (updateData.sensorId && updateData.sensorId !== existingBin.sensorId) {
        const duplicateBin = await this.binDAO.findBySensorId(updateData.sensorId)
        if (duplicateBin) {
          throw new Error('Bin with this sensor ID already exists')
        }
      }

      // Remove status from updateData if it exists (status is now calculated dynamically)
      delete updateData.status

      return await this.binDAO.updateById(id, updateData)
    } catch (error) {
      throw new Error(`Failed to update bin: ${error.message}`)
    }
  }

  /**
   * Delete a bin
   * @param {string} id - Bin ID
   * @returns {Promise<Object>} Deleted bin object
   */
  async deleteBin(id) {
    try {
      const deletedBin = await this.binDAO.deleteById(id)
      if (!deletedBin) {
        throw new Error('Bin not found')
      }
      return deletedBin
    } catch (error) {
      throw new Error(`Failed to delete bin: ${error.message}`)
    }
  }

  /**
   * Report bin fill level from sensor
   * @param {string} sensorId - Sensor ID
   * @param {number} fillLevel - Fill level percentage (0-100)
   * @returns {Promise<Object>} Updated bin object
   */
  async reportFillLevel(sensorId, fillLevel) {
    try {
      // Validate fill level
      if (fillLevel < 0 || fillLevel > 100) {
        throw new Error('Fill level must be between 0 and 100')
      }

      const updateData = {
        fillLevel,
        lastSeenAt: new Date()
      }

      const updatedBin = await this.binDAO.updateBySensorId(sensorId, updateData)
      if (!updatedBin) {
        throw new Error('Bin not found')
      }

      return updatedBin
    } catch (error) {
      throw new Error(`Failed to report fill level: ${error.message}`)
    }
  }

  /**
   * Get bins that need collection (fill level > 70%)
   * @returns {Promise<Array>} Array of bins needing collection
   */
  async getBinsNeedingCollection() {
    try {
      return await this.binDAO.findAll({ fillLevel: { $gt: 70 } })
    } catch (error) {
      throw new Error(`Failed to get bins needing collection: ${error.message}`)
    }
  }

  /**
   * Get priority bins (fill level >= 100%)
   * @returns {Promise<Array>} Array of priority bins
   */
  async getPriorityBins() {
    try {
      return await this.binDAO.findAll({ fillLevel: { $gte: 100 } })
    } catch (error) {
      throw new Error(`Failed to get priority bins: ${error.message}`)
    }
  }

  /**
   * Seed bins from data array
   * @param {Array} binsData - Array of bin data objects
   * @returns {Promise<Array>} Array of created bin objects
   */
  async seedBins(binsData) {
    try {
      // Validate all bin data
      binsData.forEach(binData => this.validateBinData(binData))

      // Clear existing bins
      await this.binDAO.deleteAll()

      // Create new bins
      return await this.binDAO.insertMany(binsData)
    } catch (error) {
      throw new Error(`Failed to seed bins: ${error.message}`)
    }
  }

  /**
   * Get bin statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getBinStatistics() {
    try {
      const allBins = await this.binDAO.findAll()
      const totalBins = allBins.length

      let full = 0, priority = 0, empty = 0, half = 0

      allBins.forEach(bin => {
        const status = this.calculateStatus(bin.fillLevel)
        switch (status) {
          case 'Priority':
            priority++
            break
          case 'Full':
            full++
            break
          case 'Half':
            half++
            break
          case 'Empty':
            empty++
            break
        }
      })

      return {
        total: totalBins,
        full,
        priority,
        empty,
        half
      }
    } catch (error) {
      throw new Error(`Failed to get bin statistics: ${error.message}`)
    }
  }

  /**
   * Validate bin data
   * @param {Object} binData - Bin data to validate
   * @private
   */
  validateBinData(binData) {
    if (!binData.sensorId || typeof binData.sensorId !== 'string') {
      throw new Error('Sensor ID is required and must be a string')
    }

    if (!binData.locationName || typeof binData.locationName !== 'string') {
      throw new Error('Location name is required and must be a string')
    }

    if (binData.fillLevel !== undefined && (typeof binData.fillLevel !== 'number' || binData.fillLevel < 0 || binData.fillLevel > 100)) {
      throw new Error('Fill level must be a number between 0 and 100')
    }
  }

  /**
   * Calculate bin status based on fill level
   * @param {number} fillLevel - Fill level percentage
   * @returns {string} Status string
   * @private
   */
  calculateStatus(fillLevel) {
    if (fillLevel >= 100) return 'Priority'
    if (fillLevel >= 70) return 'Full'
    if (fillLevel >= 25) return 'Half'
    return 'Empty'
  }
}

module.exports = BinService