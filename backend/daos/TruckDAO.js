/**
 * Data Access Object for Truck entity
 * Handles all database operations related to collection trucks
 * Follows the DAO pattern for clean separation of data access logic
 */
const Truck = require('../models/Truck')

class TruckDAO {
  /**
   * Find all trucks with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, etc.)
   * @returns {Promise<Array>} Array of truck documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = Truck.find(filter)

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find trucks: ${error.message}`)
    }
  }

  /**
   * Find a truck by its ID
   * @param {string} id - Truck document ID
   * @returns {Promise<Object|null>} Truck document or null if not found
   */
  async findById(id) {
    try {
      return await Truck.findById(id)
    } catch (error) {
      throw new Error(`Failed to find truck by ID: ${error.message}`)
    }
  }

  /**
   * Find a truck by plate number
   * @param {string} plate - Truck plate number
   * @returns {Promise<Object|null>} Truck document or null if not found
   */
  async findByPlate(plate) {
    try {
      return await Truck.findOne({ plate })
    } catch (error) {
      throw new Error(`Failed to find truck by plate: ${error.message}`)
    }
  }

  /**
   * Create a new truck
   * @param {Object} truckData - Truck data to create
   * @returns {Promise<Object>} Created truck document
   */
  async create(truckData) {
    try {
      const truck = new Truck(truckData)
      return await truck.save()
    } catch (error) {
      throw new Error(`Failed to create truck: ${error.message}`)
    }
  }

  /**
   * Update a truck by ID
   * @param {string} id - Truck document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated truck document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await Truck.findByIdAndUpdate(id, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update truck: ${error.message}`)
    }
  }

  /**
   * Delete a truck by ID
   * @param {string} id - Truck document ID
   * @returns {Promise<Object|null>} Deleted truck document or null if not found
   */
  async deleteById(id) {
    try {
      return await Truck.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete truck: ${error.message}`)
    }
  }

  /**
   * Find trucks by status
   * @param {string} status - Truck status (Active, Inactive, Maintenance)
   * @returns {Promise<Array>} Array of trucks with the specified status
   */
  async findByStatus(status) {
    try {
      return await Truck.find({ status })
    } catch (error) {
      throw new Error(`Failed to find trucks by status: ${error.message}`)
    }
  }

  /**
   * Update truck location
   * @param {string} id - Truck document ID
   * @param {Object} location - New location coordinates
   * @returns {Promise<Object|null>} Updated truck document or null if not found
   */
  async updateLocation(id, location) {
    try {
      return await Truck.findByIdAndUpdate(
        id,
        { currentLocation: location, lastLocationUpdate: new Date() },
        { new: true }
      )
    } catch (error) {
      throw new Error(`Failed to update truck location: ${error.message}`)
    }
  }

  /**
   * Count trucks matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching trucks
   */
  async count(filter = {}) {
    try {
      return await Truck.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count trucks: ${error.message}`)
    }
  }
}

module.exports = TruckDAO