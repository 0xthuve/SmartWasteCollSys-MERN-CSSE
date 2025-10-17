/**
 * Service layer for Collection operations
 * Contains business logic for waste collection records
 * Coordinates between CollectionDAO and other services
 * Follows the Service pattern for separation of concerns
 */
const CollectionDAO = require('../daos/CollectionDAO')
const BinService = require('./BinService')
const TruckService = require('./TruckService')

class CollectionService {
  constructor() {
    this.collectionDAO = new CollectionDAO()
    this.binService = new BinService()
    this.truckService = new TruckService()
  }

  /**
   * Get all collections with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collection objects
   */
  async getAllCollections(filter = {}, options = {}) {
    try {
      return await this.collectionDAO.findAll(filter, {
        sort: { date: -1 },
        populate: [
          { path: 'truck', select: 'plate model capacity' },
          { path: 'bins', select: 'sensorId locationName fillLevel' },
          { path: 'createdBy', select: 'username name' }
        ],
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to retrieve collections: ${error.message}`)
    }
  }

  /**
   * Get a collection by ID
   * @param {string} id - Collection ID
   * @returns {Promise<Object|null>} Collection object or null if not found
   */
  async getCollectionById(id) {
    try {
      const collection = await this.collectionDAO.findById(id, {
        populate: [
          { path: 'truck', select: 'plate model capacity' },
          { path: 'bins', select: 'sensorId locationName fillLevel status' },
          { path: 'createdBy', select: 'username name' }
        ]
      })
      if (!collection) {
        throw new Error('Collection not found')
      }
      return collection
    } catch (error) {
      throw new Error(`Failed to retrieve collection: ${error.message}`)
    }
  }

  /**
   * Create a new collection record
   * @param {Object} collectionData - Collection data
   * @param {string} userId - ID of user creating the collection
   * @returns {Promise<Object>} Created collection object
   */
  async createCollection(collectionData, userId) {
    try {
      // Validate required fields
      this.validateCollectionData(collectionData)

      // Verify truck exists and is active
      const truck = await this.truckService.getTruckById(collectionData.truck)
      if (truck.status !== 'Active') {
        throw new Error('Cannot create collection for inactive truck')
      }

      // Verify all bins exist (only if bins are provided)
      if (collectionData.bins && collectionData.bins.length > 0) {
        for (const binId of collectionData.bins) {
          await this.binService.getBinById(binId)
        }
      }

      // Set default values and user
      const collectionToCreate = {
        ...collectionData,
        date: collectionData.date || new Date(),
        createdBy: userId
      }

      return await this.collectionDAO.create(collectionToCreate)
    } catch (error) {
      throw new Error(`Failed to create collection: ${error.message}`)
    }
  }

  /**
   * Update a collection
   * @param {string} id - Collection ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated collection object
   */
  async updateCollection(id, updateData) {
    try {
      // Validate the collection exists
      const existingCollection = await this.collectionDAO.findById(id)
      if (!existingCollection) {
        throw new Error('Collection not found')
      }

      // Validate update data
      if (updateData.truck) {
        const truck = await this.truckService.getTruckById(updateData.truck)
        if (truck.status !== 'Active') {
          throw new Error('Cannot update collection with inactive truck')
        }
      }

      if (updateData.bins && updateData.bins.length > 0) {
        for (const binId of updateData.bins) {
          await this.binService.getBinById(binId)
        }
      }

      return await this.collectionDAO.updateById(id, updateData)
    } catch (error) {
      throw new Error(`Failed to update collection: ${error.message}`)
    }
  }

  /**
   * Delete a collection
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} Deleted collection object
   */
  async deleteCollection(id) {
    try {
      const deletedCollection = await this.collectionDAO.deleteById(id)
      if (!deletedCollection) {
        throw new Error('Collection not found')
      }
      return deletedCollection
    } catch (error) {
      throw new Error(`Failed to delete collection: ${error.message}`)
    }
  }

  /**
   * Get collections by truck
   * @param {string} truckId - Truck ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections for the specified truck
   */
  async getCollectionsByTruck(truckId, options = {}) {
    try {
      // Verify truck exists
      await this.truckService.getTruckById(truckId)

      return await this.collectionDAO.findByTruck(truckId, {
        populate: [
          { path: 'bins', select: 'sensorId locationName fillLevel' },
          { path: 'createdBy', select: 'username name' }
        ],
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to get collections by truck: ${error.message}`)
    }
  }

  /**
   * Get collections by bin
   * @param {string} binId - Bin ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections for the specified bin
   */
  async getCollectionsByBin(binId, options = {}) {
    try {
      // Verify bin exists
      await this.binService.getBinById(binId)

      return await this.collectionDAO.findByBin(binId, {
        populate: [
          { path: 'truck', select: 'plate model capacity' },
          { path: 'createdBy', select: 'username name' }
        ],
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to get collections by bin: ${error.message}`)
    }
  }

  /**
   * Get collections by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of collections within the date range
   */
  async getCollectionsByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.collectionDAO.findByDateRange(startDate, endDate, {
        populate: [
          { path: 'truck', select: 'plate model' },
          { path: 'bins', select: 'sensorId locationName' },
          { path: 'createdBy', select: 'username name' }
        ],
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to get collections by date range: ${error.message}`)
    }
  }

  /**
   * Get collection statistics for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Statistics object
   */
  async getCollectionStatistics(startDate, endDate) {
    try {
      return await this.collectionDAO.getStatistics(startDate, endDate)
    } catch (error) {
      throw new Error(`Failed to get collection statistics: ${error.message}`)
    }
  }

  /**
   * Get collection summary for dashboard
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Dashboard summary
   */
  async getDashboardSummary(days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const stats = await this.getCollectionStatistics(startDate, endDate)
      const recentCollections = await this.collectionDAO.findByDateRange(
        startDate,
        endDate,
        { limit: 10 }
      )

      return {
        statistics: stats,
        recentCollections,
        period: {
          start: startDate,
          end: endDate,
          days
        }
      }
    } catch (error) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`)
    }
  }

  /**
   * Validate collection data
   * @param {Object} collectionData - Collection data to validate
   * @private
   */
  validateCollectionData(collectionData) {
    if (!collectionData.truck || typeof collectionData.truck !== 'string') {
      throw new Error('Truck ID is required and must be a string')
    }

    // Bins are now optional
    if (collectionData.bins && !Array.isArray(collectionData.bins)) {
      throw new Error('Bins must be an array if provided')
    }

    // Validate waste amounts
    const wasteFields = ['generalWaste', 'recyclables', 'organic']
    for (const field of wasteFields) {
      if (collectionData[field] !== undefined) {
        if (typeof collectionData[field] !== 'number' || collectionData[field] < 0) {
          throw new Error(`${field} must be a non-negative number`)
        }
      }
    }

    // Validate date if provided
    if (collectionData.date) {
      const date = new Date(collectionData.date)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }
    }
  }
}

module.exports = CollectionService