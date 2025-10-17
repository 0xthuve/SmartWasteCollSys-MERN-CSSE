/**
 * Data Access Object for Report entity
 * Handles all database operations related to analytics and reporting
 * Follows the DAO pattern for clean separation of data access logic
 */
const Report = require('../models/Report')

class ReportDAO {
  /**
   * Find all reports with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, populate, etc.)
   * @returns {Promise<Array>} Array of report documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = Report.find(filter)

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
      throw new Error(`Failed to find reports: ${error.message}`)
    }
  }

  /**
   * Find a report by its ID
   * @param {string} id - Report document ID
   * @param {Object} options - Query options (populate, etc.)
   * @returns {Promise<Object|null>} Report document or null if not found
   */
  async findById(id, options = {}) {
    try {
      const query = Report.findById(id)

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
      throw new Error(`Failed to find report by ID: ${error.message}`)
    }
  }

  /**
   * Create a new report
   * @param {Object} reportData - Report data to create
   * @returns {Promise<Object>} Created report document
   */
  async create(reportData) {
    try {
      const report = new Report(reportData)
      return await report.save()
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`)
    }
  }

  /**
   * Update a report by ID
   * @param {string} id - Report document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated report document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await Report.findByIdAndUpdate(id, updateData, options)
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`)
    }
  }

  /**
   * Delete a report by ID
   * @param {string} id - Report document ID
   * @returns {Promise<Object|null>} Deleted report document or null if not found
   */
  async deleteById(id) {
    try {
      return await Report.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`)
    }
  }

  /**
   * Find reports by type
   * @param {string} type - Report type (daily, weekly, monthly, efficiency)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reports with the specified type
   */
  async findByType(type, options = {}) {
    try {
      const query = Report.find({ type })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find reports by type: ${error.message}`)
    }
  }

  /**
   * Find reports by date range
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reports within the date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const query = Report.find({
        'period.start': { $gte: startDate },
        'period.end': { $lte: endDate }
      })

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find reports by date range: ${error.message}`)
    }
  }

  /**
   * Find the latest report of a specific type
   * @param {string} type - Report type
   * @returns {Promise<Object|null>} Latest report document or null if not found
   */
  async findLatestByType(type) {
    try {
      return await Report.findOne({ type })
        .sort({ generatedAt: -1 })
        .exec()
    } catch (error) {
      throw new Error(`Failed to find latest report by type: ${error.message}`)
    }
  }

  /**
   * Get report statistics for dashboard
   * @param {Date} startDate - Start date for statistics
   * @param {Date} endDate - End date for statistics
   * @returns {Promise<Object>} Aggregated statistics from reports
   */
  async getDashboardStats(startDate, endDate) {
    try {
      const result = await Report.aggregate([
        {
          $match: {
            'period.start': { $gte: startDate },
            'period.end': { $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            avgCollections: { $avg: '$data.totalCollections' },
            avgDistance: { $avg: '$data.totalDistance' },
            avgTime: { $avg: '$data.totalTime' },
            totalEfficiencyTime: { $sum: '$data.efficiency.timeSaved' },
            totalEfficiencyDistance: { $sum: '$data.efficiency.distanceSaved' },
            totalEfficiencyFuel: { $sum: '$data.efficiency.fuelSaved' }
          }
        }
      ])

      return result.length > 0 ? result[0] : {
        totalReports: 0,
        avgCollections: 0,
        avgDistance: 0,
        avgTime: 0,
        totalEfficiencyTime: 0,
        totalEfficiencyDistance: 0,
        totalEfficiencyFuel: 0
      }
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`)
    }
  }

  /**
   * Count reports matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching reports
   */
  async count(filter = {}) {
    try {
      return await Report.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count reports: ${error.message}`)
    }
  }
}

module.exports = ReportDAO