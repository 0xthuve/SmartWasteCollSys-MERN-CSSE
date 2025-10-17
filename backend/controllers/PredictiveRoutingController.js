/**
 * Controller for Predictive Routing operations
 * Handles HTTP requests for predictive analysis and route optimization
 * Validates input, calls service layer, and returns appropriate responses
 * Follows MVC pattern with separation of concerns
 */
const PredictiveRoutingService = require('../services/PredictiveRoutingService')

class PredictiveRoutingController {
  constructor() {
    this.predictiveRoutingService = new PredictiveRoutingService()
  }

  /**
   * Analyze historical collection data
   * POST /api/predictive-routing/analyze-history
   */
  async analyzeHistoricalData(req, res) {
    try {
      const { startDate, endDate } = req.body

      // Validate dates
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = endDate ? new Date(endDate) : new Date()

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format'
        })
      }

      if (start >= end) {
        return res.status(400).json({
          error: 'Start date must be before end date'
        })
      }

      const result = await this.predictiveRoutingService.analyzeHistoricalData(start, end)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Historical analysis error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Generate predictive routes based on historical data
   * POST /api/predictive-routing/generate-routes
   */
  async generatePredictiveRoutes(req, res) {
    try {
      const options = req.body || {}

      const result = await this.predictiveRoutingService.generatePredictiveRoutes(options)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Predictive routes generation error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Get predictive report for dashboard
   * GET /api/predictive-routing/report
   */
  async getPredictiveReport(req, res) {
    try {
      const { days } = req.query
      const daysNum = parseInt(days) || 30

      if (daysNum < 1 || daysNum > 365) {
        return res.status(400).json({
          error: 'Days must be between 1 and 365'
        })
      }

      const result = await this.predictiveRoutingService.getPredictiveReport(daysNum)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Predictive report error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Update bin data after collection completion
   * POST /api/predictive-routing/update-after-collection
   */
  async updateBinAfterCollection(req, res) {
    try {
      const { binId, collectionDate } = req.body

      if (!binId) {
        return res.status(400).json({
          error: 'Bin ID is required'
        })
      }

      const collectionDateObj = collectionDate ? new Date(collectionDate) : new Date()

      if (isNaN(collectionDateObj.getTime())) {
        return res.status(400).json({
          error: 'Invalid collection date format'
        })
      }

      const result = await this.predictiveRoutingService.updateBinAfterCollection(binId, collectionDateObj)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Update after collection error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * Get predictive insights for specific bins
   * GET /api/predictive-routing/insights
   */
  async getPredictiveInsights(req, res) {
    try {
      const { binIds } = req.query

      if (!binIds) {
        return res.status(400).json({
          error: 'Bin IDs are required'
        })
      }

      const binIdArray = Array.isArray(binIds) ? binIds : binIds.split(',')

      // Get predictive data for specified bins
      const insights = []
      for (const binId of binIdArray) {
        try {
          const bin = await this.predictiveRoutingService.binService.getBinById(binId)
          insights.push({
            binId: bin._id,
            sensorId: bin.sensorId,
            locationName: bin.locationName,
            currentFillLevel: bin.fillLevel,
            predictiveFillRate: bin.predictiveFillRate,
            collectionFrequency: bin.collectionFrequency,
            priorityScore: bin.priorityScore,
            lastCollectionDate: bin.lastCollectionDate
          })
        } catch (error) {
          // Skip invalid bin IDs
          continue
        }
      }

      res.status(200).json({
        success: true,
        data: {
          insights,
          totalBins: insights.length
        }
      })
    } catch (error) {
      console.error('Predictive insights error:', error)
      res.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = PredictiveRoutingController