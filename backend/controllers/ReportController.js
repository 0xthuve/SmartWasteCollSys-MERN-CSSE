/**
 * Controller layer for Report operations
 * Handles HTTP requests and responses for reporting endpoints
 * Validates input, calls ReportService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const ReportService = require('../services/ReportService')

class ReportController {
  constructor() {
    this.reportService = new ReportService()
  }

  /**
   * Get all reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllReports(req, res) {
    try {
      const reports = await this.reportService.getAllReports()
      res.json(reports)
    } catch (error) {
      console.error('Error in getAllReports:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get a report by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReportById(req, res) {
    try {
      const { id } = req.params
      const report = await this.reportService.getReportById(id)
      res.json(report)
    } catch (error) {
      console.error('Error in getReportById:', error)

      if (error.message === 'Report not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate a daily report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateDailyReport(req, res) {
    try {
      const { date } = req.query
      const reportDate = date ? new Date(date) : new Date()

      if (date && isNaN(reportDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' })
      }

      const report = await this.reportService.generateDailyReport(reportDate)
      res.status(201).json(report)
    } catch (error) {
      console.error('Error in generateDailyReport:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate a weekly report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateWeeklyReport(req, res) {
    try {
      const { weekStart } = req.query
      const startDate = weekStart ? new Date(weekStart) : null

      if (weekStart && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid week start date format' })
      }

      const report = await this.reportService.generateWeeklyReport(startDate)
      res.status(201).json(report)
    } catch (error) {
      console.error('Error in generateWeeklyReport:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate a monthly report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateMonthlyReport(req, res) {
    try {
      const { monthStart } = req.query
      const startDate = monthStart ? new Date(monthStart) : null

      if (monthStart && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid month start date format' })
      }

      const report = await this.reportService.generateMonthlyReport(startDate)
      res.status(201).json(report)
    } catch (error) {
      console.error('Error in generateMonthlyReport:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate an efficiency report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateEfficiencyReport(req, res) {
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

      const report = await this.reportService.generateEfficiencyReport(start, end)
      res.status(201).json(report)
    } catch (error) {
      console.error('Error in generateEfficiencyReport:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Delete a report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteReport(req, res) {
    try {
      const { id } = req.params
      const report = await this.reportService.deleteReport(id)
      res.json({ success: true, deletedReport: report })
    } catch (error) {
      console.error('Error in deleteReport:', error)

      if (error.message === 'Report not found') {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get dashboard statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardStats(req, res) {
    try {
      const { days } = req.query
      const daysNum = days ? parseInt(days) : 30

      if (daysNum < 1 || daysNum > 365) {
        return res.status(400).json({ error: 'Days must be between 1 and 365' })
      }

      const stats = await this.reportService.getDashboardStats(daysNum)
      res.json(stats)
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Get the latest report of a specific type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLatestReportByType(req, res) {
    try {
      const { type } = req.params

      if (!type) {
        return res.status(400).json({ error: 'Report type is required' })
      }

      const validTypes = ['daily', 'weekly', 'monthly', 'efficiency']
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid report type. Must be daily, weekly, monthly, or efficiency' })
      }

      const report = await this.reportService.getLatestReportByType(type)

      if (!report) {
        return res.status(404).json({ error: `No ${type} report found` })
      }

      res.json(report)
    } catch (error) {
      console.error('Error in getLatestReportByType:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Generate a report based on type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateReport(req, res) {
    try {
      const { type, startDate, endDate } = req.body

      if (!type) {
        return res.status(400).json({ error: 'Report type is required' })
      }

      const validTypes = ['daily', 'weekly', 'monthly', 'efficiency']
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid report type. Must be daily, weekly, monthly, or efficiency' })
      }

      let report
      if (type === 'daily') {
        const reportDate = startDate ? new Date(startDate) : new Date()
        if (startDate && isNaN(reportDate.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' })
        }
        report = await this.reportService.generateDailyReport(reportDate)
      } else if (type === 'weekly') {
        const start = startDate ? new Date(startDate) : null
        if (startDate && isNaN(start.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' })
        }
        report = await this.reportService.generateWeeklyReport(start)
      } else if (type === 'monthly') {
        const start = startDate ? new Date(startDate) : null
        if (startDate && isNaN(start.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' })
        }
        report = await this.reportService.generateMonthlyReport(start)
      } else if (type === 'efficiency') {
        if (!startDate || !endDate) {
          return res.status(400).json({ error: 'Start date and end date are required for efficiency reports' })
        }
        const start = new Date(startDate)
        const end = new Date(endDate)
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' })
        }
        if (start > end) {
          return res.status(400).json({ error: 'Start date must be before end date' })
        }
        report = await this.reportService.generateEfficiencyReport(start, end)
      }

      res.status(201).json(report)
    } catch (error) {
      console.error('Error in generateReport:', error)
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = ReportController