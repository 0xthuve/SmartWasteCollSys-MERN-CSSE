/**
 * Data Access Object for RoutePlan entity
 * Handles all database operations related to route planning and optimization
 * Follows the DAO pattern for clean separation of data access logic
 */
const RoutePlan = require('../models/RoutePlan')

class RoutePlanDAO {
  /**
   * Find all route plans with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, populate, etc.)
   * @returns {Promise<Array>} Array of route plan documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = RoutePlan.find(filter)

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
      throw new Error(`Failed to find route plans: ${error.message}`)
    }
  }

  /**
   * Find a route plan by its ID
   * @param {string} id - Route plan document ID
   * @param {Object} options - Query options (populate, etc.)
   * @returns {Promise<Object|null>} Route plan document or null if not found
   */
  async findById(id, options = {}) {
    try {
      const query = RoutePlan.findById(id)

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
      throw new Error(`Failed to find route plan by ID: ${error.message}`)
    }
  }

  /**
   * Create a new route plan
   * @param {Object} routePlanData - Route plan data to create
   * @returns {Promise<Object>} Created route plan document
   */
  async create(routePlanData) {
    try {
      const routePlan = new RoutePlan(routePlanData)
      return await routePlan.save()
    } catch (error) {
      throw new Error(`Failed to create route plan: ${error.message}`)
    }
  }

  /**
   * Update a route plan by ID
   * @param {string} id - Route plan document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated route plan document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await RoutePlan.findByIdAndUpdate(id, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update route plan: ${error.message}`)
    }
  }

  /**
   * Delete a route plan by ID
   * @param {string} id - Route plan document ID
   * @returns {Promise<Object|null>} Deleted route plan document or null if not found
   */
  async deleteById(id) {
    try {
      return await RoutePlan.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete route plan: ${error.message}`)
    }
  }

  /**
   * Find route plans by status
   * @param {string} status - Route plan status (planned, dispatched, in-progress, completed)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of route plans with the specified status
   */
  async findByStatus(status, options = {}) {
    try {
      const query = RoutePlan.find({ status })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find route plans by status: ${error.message}`)
    }
  }

  /**
   * Find route plans by date range
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of route plans within the date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const query = RoutePlan.find({
        generatedFor: {
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

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find route plans by date range: ${error.message}`)
    }
  }

  /**
   * Approve a route plan
   * @param {string} id - Route plan document ID
   * @returns {Promise<Object|null>} Updated route plan document or null if not found
   */
  async approve(id) {
    try {
      return await RoutePlan.findByIdAndUpdate(
        id,
        { approved: true },
        { new: true }
      )
    } catch (error) {
      throw new Error(`Failed to approve route plan: ${error.message}`)
    }
  }

  /**
   * Dispatch a route plan
   * @param {string} id - Route plan document ID
   * @returns {Promise<Object|null>} Updated route plan document or null if not found
   */
  async dispatch(id) {
    try {
      return await RoutePlan.findByIdAndUpdate(
        id,
        {
          status: 'dispatched',
          dispatchedAt: new Date()
        },
        { new: true }
      )
    } catch (error) {
      throw new Error(`Failed to dispatch route plan: ${error.message}`)
    }
  }

  /**
   * Mark a route plan as completed
   * @param {string} id - Route plan document ID
   * @returns {Promise<Object|null>} Updated route plan document or null if not found
   */
  async complete(id) {
    try {
      return await RoutePlan.findByIdAndUpdate(
        id,
        {
          status: 'completed',
          completedAt: new Date()
        },
        { new: true }
      )
    } catch (error) {
      throw new Error(`Failed to complete route plan: ${error.message}`)
    }
  }

  /**
   * Count route plans matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching route plans
   */
  async count(filter = {}) {
    try {
      return await RoutePlan.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count route plans: ${error.message}`)
    }
  }
}

module.exports = RoutePlanDAO