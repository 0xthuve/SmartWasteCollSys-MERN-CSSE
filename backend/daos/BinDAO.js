/**
 * Data Access Object for Bin entity
 * Handles all database operations related to waste bins
 * Follows the DAO pattern for clean separation of data access logic
 */
const Bin = require('../models/Bin')

class BinDAO {
  /**
   * Find all bins with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, etc.)
   * @returns {Promise<Array>} Array of bin documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = Bin.find(filter)

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find bins: ${error.message}`)
    }
  }

  /**
   * Find a bin by its ID
   * @param {string} id - Bin document ID
   * @returns {Promise<Object|null>} Bin document or null if not found
   */
  async findById(id) {
    try {
      return await Bin.findById(id)
    } catch (error) {
      throw new Error(`Failed to find bin by ID: ${error.message}`)
    }
  }

  /**
   * Find a bin by sensor ID
   * @param {string} sensorId - Unique sensor identifier
   * @returns {Promise<Object|null>} Bin document or null if not found
   */
  async findBySensorId(sensorId) {
    try {
      return await Bin.findOne({ sensorId })
    } catch (error) {
      throw new Error(`Failed to find bin by sensor ID: ${error.message}`)
    }
  }

  /**
   * Create a new bin
   * @param {Object} binData - Bin data to create
   * @returns {Promise<Object>} Created bin document
   */
  async create(binData) {
    try {
      const bin = new Bin(binData)
      return await bin.save()
    } catch (error) {
      throw new Error(`Failed to create bin: ${error.message}`)
    }
  }

  /**
   * Update a bin by ID
   * @param {string} id - Bin document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated bin document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await Bin.findByIdAndUpdate(id, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update bin: ${error.message}`)
    }
  }

  /**
   * Update a bin by sensor ID
   * @param {string} sensorId - Unique sensor identifier
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated bin document or null if not found
   */
  async updateBySensorId(sensorId, updateData, options = { new: true }) {
    try {
      return await Bin.findOneAndUpdate({ sensorId }, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update bin by sensor ID: ${error.message}`)
    }
  }

  /**
   * Delete a bin by ID
   * @param {string} id - Bin document ID
   * @returns {Promise<Object|null>} Deleted bin document or null if not found
   */
  async deleteById(id) {
    try {
      return await Bin.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete bin: ${error.message}`)
    }
  }

  /**
   * Delete all bins (used for seeding/resetting data)
   * @returns {Promise<Object>} Delete operation result
   */
  async deleteAll() {
    try {
      return await Bin.deleteMany({})
    } catch (error) {
      throw new Error(`Failed to delete all bins: ${error.message}`)
    }
  }

  /**
   * Insert multiple bins (used for seeding)
   * @param {Array} binsData - Array of bin data objects
   * @returns {Promise<Array>} Array of inserted bin documents
   */
  async insertMany(binsData) {
    try {
      return await Bin.insertMany(binsData)
    } catch (error) {
      throw new Error(`Failed to insert bins: ${error.message}`)
    }
  }

  /**
   * Count bins matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching bins
   */
  async count(filter = {}) {
    try {
      return await Bin.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count bins: ${error.message}`)
    }
  }
}

module.exports = BinDAO