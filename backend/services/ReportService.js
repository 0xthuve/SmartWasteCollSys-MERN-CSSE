/**
 * Service layer for Report operations
 * Contains business logic for analytics and reporting
 * Coordinates between ReportDAO and other services
 * Follows the Service pattern for separation of concerns
 */
const ReportDAO = require('../daos/ReportDAO')
const CollectionService = require('./CollectionService')
const RoutePlanService = require('./RoutePlanService')
const BinService = require('./BinService')
const TruckService = require('./TruckService')

class ReportService {
  constructor() {
    this.reportDAO = new ReportDAO()
    this.collectionService = new CollectionService()
    this.routePlanService = new RoutePlanService()
    this.binService = new BinService()
    this.truckService = new TruckService()
  }

  /**
   * Get all reports with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of report objects
   */
  async getAllReports(filter = {}, options = {}) {
    try {
      return await this.reportDAO.findAll(filter, {
        sort: { generatedAt: -1 },
        ...options
      })
    } catch (error) {
      throw new Error(`Failed to retrieve reports: ${error.message}`)
    }
  }

  /**
   * Get a report by ID
   * @param {string} id - Report ID
   * @returns {Promise<Object|null>} Report object or null if not found
   */
  async getReportById(id) {
    try {
      const report = await this.reportDAO.findById(id)
      if (!report) {
        throw new Error('Report not found')
      }
      return report
    } catch (error) {
      throw new Error(`Failed to retrieve report: ${error.message}`)
    }
  }

  /**
   * Generate a daily report
   * @param {Date} date - Date for the report (defaults to today)
   * @returns {Promise<Object>} Generated daily report
   */
  async generateDailyReport(date = new Date()) {
    try {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      const reportData = await this.generateReportData('daily', startDate, endDate)
      return await this.reportDAO.create(reportData)
    } catch (error) {
      throw new Error(`Failed to generate daily report: ${error.message}`)
    }
  }

  /**
   * Generate a weekly report
   * @param {Date} weekStart - Start date of the week (defaults to current week start)
   * @returns {Promise<Object>} Generated weekly report
   */
  async generateWeeklyReport(weekStart = null) {
    try {
      const startDate = weekStart || this.getWeekStart(new Date())
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)

      const reportData = await this.generateReportData('weekly', startDate, endDate)
      return await this.reportDAO.create(reportData)
    } catch (error) {
      throw new Error(`Failed to generate weekly report: ${error.message}`)
    }
  }

  /**
   * Generate a monthly report
   * @param {Date} monthStart - Start date of the month (defaults to current month start)
   * @returns {Promise<Object>} Generated monthly report
   */
  async generateMonthlyReport(monthStart = null) {
    try {
      const startDate = monthStart || this.getMonthStart(new Date())
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // Last day of the month
      endDate.setHours(23, 59, 59, 999)

      const reportData = await this.generateReportData('monthly', startDate, endDate)
      return await this.reportDAO.create(reportData)
    } catch (error) {
      throw new Error(`Failed to generate monthly report: ${error.message}`)
    }
  }

  /**
   * Generate an efficiency report
   * @param {Date} startDate - Start date for the report
   * @param {Date} endDate - End date for the report
   * @returns {Promise<Object>} Generated efficiency report
   */
  async generateEfficiencyReport(startDate, endDate) {
    try {
      const reportData = await this.generateReportData('efficiency', startDate, endDate)
      return await this.reportDAO.create(reportData)
    } catch (error) {
      throw new Error(`Failed to generate efficiency report: ${error.message}`)
    }
  }

  /**
   * Generate report data based on type and date range
   * @param {string} type - Report type
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Report data object
   * @private
   */
  async generateReportData(type, startDate, endDate) {
    try {
      // Get collections data
      const collections = await this.collectionService.getCollectionsByDateRange(startDate, endDate)
      const collectionStats = await this.collectionService.getCollectionStatistics(startDate, endDate)

      // Get route plans data
      const routePlans = await this.routePlanService.getRoutePlansByDateRange(startDate, endDate)

      // Get current bin and truck data
      const bins = await this.binService.getAllBinsWithStatus()
      const trucks = await this.truckService.getAllTrucks()

      // Calculate metrics
      const totalCollections = collections.length
      const totalBinsEmptied = collections.reduce((sum, col) => sum + col.bins.length, 0)
      const totalDistance = routePlans.reduce((sum, plan) =>
        sum + plan.routes.reduce((routeSum, route) => routeSum + route.totalDistance, 0), 0)
      const totalTime = routePlans.reduce((sum, plan) =>
        sum + plan.routes.reduce((routeSum, route) => routeSum + route.estimatedTimeMin, 0), 0)

      // Calculate average fill level
      const averageFillLevel = bins.length > 0
        ? bins.reduce((sum, bin) => sum + bin.fillLevel, 0) / bins.length
        : 0

      // Calculate efficiency metrics
      const efficiency = this.calculateEfficiencyMetrics(routePlans)

      // Get truck utilization data
      const truckUtilization = this.calculateTruckUtilization(routePlans, trucks)

      // Get bin performance data
      const binPerformance = this.calculateBinPerformance(bins, collections, startDate, endDate)

      return {
        type,
        period: {
          start: startDate,
          end: endDate
        },
        data: {
          totalCollections,
          totalBinsEmptied,
          totalDistance: Math.round(totalDistance * 100) / 100,
          totalTime,
          averageFillLevel: Math.round(averageFillLevel * 100) / 100,
          efficiency,
          truckUtilization,
          binPerformance
        }
      }
    } catch (error) {
      throw new Error(`Failed to generate report data: ${error.message}`)
    }
  }

  /**
   * Calculate efficiency metrics from route plans
   * @param {Array} routePlans - Route plans data
   * @returns {Object} Efficiency metrics
   * @private
   */
  calculateEfficiencyMetrics(routePlans) {
    const totalTimeSaved = routePlans.reduce((sum, plan) => sum + plan.efficiency.timeSaved, 0)
    const totalDistanceSaved = routePlans.reduce((sum, plan) => sum + plan.efficiency.distanceSaved, 0)
    const totalFuelSaved = routePlans.reduce((sum, plan) => sum + plan.efficiency.fuelSaved, 0)

    return {
      timeSaved: Math.round(totalTimeSaved),
      distanceSaved: Math.round(totalDistanceSaved * 100) / 100,
      fuelSaved: Math.round(totalFuelSaved * 100) / 100
    }
  }

  /**
   * Calculate truck utilization metrics
   * @param {Array} routePlans - Route plans data
   * @param {Array} trucks - All trucks data
   * @returns {Array} Truck utilization data
   * @private
   */
  calculateTruckUtilization(routePlans, trucks) {
    return trucks.map(truck => {
      const truckRoutes = routePlans.flatMap(plan =>
        plan.routes.filter(route => route.truckId.toString() === truck._id.toString())
      )

      const routesCompleted = truckRoutes.length
      const totalDistance = truckRoutes.reduce((sum, route) => sum + route.totalDistance, 0)
      const totalTime = truckRoutes.reduce((sum, route) => sum + route.estimatedTimeMin, 0)

      return {
        truckId: truck._id,
        truckPlate: truck.plate,
        routesCompleted,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalTime: Math.round(totalTime)
      }
    }).filter(utilization => utilization.routesCompleted > 0)
  }

  /**
   * Calculate bin performance metrics
   * @param {Array} bins - All bins data
   * @param {Array} collections - Collections data
   * @param {Date} startDate - Report start date
   * @param {Date} endDate - Report end date
   * @returns {Array} Bin performance data
   * @private
   */
  calculateBinPerformance(bins, collections, startDate, endDate) {
    return bins.map(bin => {
      const binCollections = collections.filter(col =>
        col.bins.some(b => b._id.toString() === bin._id.toString())
      )

      const collectionFrequency = binCollections.length
      const averageFillRate = bin.historicalAvgFill || bin.fillLevel
      const overflowIncidents = binCollections.filter(col =>
        col.bins.find(b => b._id.toString() === bin._id.toString() && b.fillLevel >= 100)
      ).length

      return {
        sensorId: bin.sensorId,
        location: {
          lat: 0, // Would be populated with actual coordinates
          lng: 0
        },
        averageFillRate: Math.round(averageFillRate * 100) / 100,
        collectionFrequency,
        overflowIncidents
      }
    })
  }

  /**
   * Delete a report
   * @param {string} id - Report ID
   * @returns {Promise<Object>} Deleted report object
   */
  async deleteReport(id) {
    try {
      const deletedReport = await this.reportDAO.deleteById(id)
      if (!deletedReport) {
        throw new Error('Report not found')
      }
      return deletedReport
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`)
    }
  }

  /**
   * Get dashboard statistics
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      return await this.reportDAO.getDashboardStats(startDate, endDate)
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`)
    }
  }

  /**
   * Get the latest report of a specific type
   * @param {string} type - Report type
   * @returns {Promise<Object|null>} Latest report or null if not found
   */
  async getLatestReportByType(type) {
    try {
      return await this.reportDAO.findLatestByType(type)
    } catch (error) {
      throw new Error(`Failed to get latest report by type: ${error.message}`)
    }
  }

  /**
   * Get week start date (Monday)
   * @param {Date} date - Reference date
   * @returns {Date} Week start date
   * @private
   */
  getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  /**
   * Get month start date
   * @param {Date} date - Reference date
   * @returns {Date} Month start date
   * @private
   */
  getMonthStart(date) {
    const d = new Date(date)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }
}

module.exports = ReportService