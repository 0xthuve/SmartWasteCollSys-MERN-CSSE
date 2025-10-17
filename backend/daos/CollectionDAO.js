/**
 * Data Access Object for Collection entity
 * Handles all database operations related to waste collection records
 * Follows the DAO pattern for clean separation of data access logic
 */
const Collection = require('../models/Collection')

class CollectionDAO {
  /**
   * Find all collections with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, populate, etc.)
   * @returns {Promise<Array>} Array of collection documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = Collection.find(filter)

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(populateOption => {
            query.populate(populateOption)
          })
        } else {
          query.populate(options.populate)
        }
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find collections: ${error.message}`)
    }
  }

  /**
   * Find a collection by its ID
   * @param {string} id - Collection document ID
   * @param {Object} options - Query options (populate, etc.)
   * @returns {Promise<Object|null>} Collection document or null if not found
   */
  async findById(id, options = {}) {
    try {
      const query = Collection.findById(id)

      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(populateOption => {
            query.populate(populateOption)
          })
        } else {
          query.populate(options.populate)
        }
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find collection by ID: ${error.message}`)
    }
  }

  /**
   * Create a new collection record
   * @param {Object} collectionData - Collection data to create
   * @returns {Promise<Object>} Created collection document
   */
  async create(collectionData) {
    try {
      const collection = new Collection(collectionData)
      return await collection.save()
    } catch (error) {
      throw new Error(`Failed to create collection: ${error.message}`)
    }
  }

  /**
   * Update a collection by ID
   * @param {string} id - Collection document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated collection document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await Collection.findByIdAndUpdate(id, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update collection: ${error.message}`)
    }
  }

  /**
   * Delete a collection by ID
   * @param {string} id - Collection document ID
   * @returns {Promise<Object|null>} Deleted collection document or null if not found
   */
  async deleteById(id) {
    try {
      return await Collection.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete collection: ${error.message}`)
    }
  }

  /**
   * Find collections by truck
   * @param {string} truckId - Truck document ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections for the specified truck
   */
  async findByTruck(truckId, options = {}) {
    try {
      const query = Collection.find({ truck: truckId })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      if (options.populate) {
        query.populate(options.populate)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find collections by truck: ${error.message}`)
    }
  }

  /**
   * Find collections by date range
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections within the date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const query = Collection.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      if (options.populate) {
        query.populate(options.populate)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find collections by date range: ${error.message}`)
    }
  }

  /**
   * Get collection statistics for a date range
   * @param {Date} startDate - Start date for statistics
   * @param {Date} endDate - End date for statistics
   * @returns {Promise<Object>} Statistics object with totals
   */
  async getStatistics(startDate, endDate) {
    try {
      const result = await Collection.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            totalCollections: { $sum: 1 },
            totalGeneralWaste: { $sum: '$generalWaste' },
            totalRecyclables: { $sum: '$recyclables' },
            totalOrganic: { $sum: '$organic' },
            totalWaste: {
              $sum: {
                $add: ['$generalWaste', '$recyclables', '$organic']
              }
            }
          }
        }
      ])

      return result.length > 0 ? result[0] : {
        totalCollections: 0,
        totalGeneralWaste: 0,
        totalRecyclables: 0,
        totalOrganic: 0,
        totalWaste: 0
      }
    } catch (error) {
      throw new Error(`Failed to get collection statistics: ${error.message}`)
    }
  }

  /**
   * Count collections matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching collections
   */
  async count(filter = {}) {
    try {
      return await Collection.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count collections: ${error.message}`)
    }
  }

  /**
   * Find collections by bin
   * @param {string} binId - Bin document ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections for the specified bin
   */
  async findByBin(binId, options = {}) {
    try {
      const query = Collection.find({ bins: binId })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      if (options.populate) {
        query.populate(options.populate)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find collections by bin: ${error.message}`)
    }
  }
}

module.exports = CollectionDAO