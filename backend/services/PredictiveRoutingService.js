/**
 * Service layer for Predictive Routing operations
 * Contains business logic for historical data analysis and predictive route optimization
 * Calculates average fill levels, collection frequencies, and optimizes routes based on predictions
 * Follows the Service pattern for separation of concerns
 */
const BinService = require('./BinService')
const CollectionService = require('./CollectionService')
const TruckAllocationService = require('./TruckAllocationService')

class PredictiveRoutingService {
  constructor() {
    this.binService = new BinService()
    this.collectionService = new CollectionService()
    this.truckAllocationService = new TruckAllocationService()
  }

  /**
   * Analyze historical collection data and update predictive metrics
   * @param {Date} startDate - Start date for analysis
   * @param {Date} endDate - End date for analysis
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeHistoricalData(startDate, endDate) {
    try {
      // Get all collections in the date range
      const collections = await this.collectionService.getCollectionsByDateRange(startDate, endDate)

      // Get all bins
      const bins = await this.binService.getAllBinsWithStatus()

      const analysisResults = {
        totalCollections: collections.length,
        binsAnalyzed: bins.length,
        predictiveUpdates: []
      }

      // Analyze each bin's collection history
      for (const bin of bins) {
        const binCollections = collections.filter(collection =>
          collection.bins && collection.bins.some(b => b.toString() === bin._id.toString())
        )

        if (binCollections.length > 0) {
          const predictiveMetrics = this.calculatePredictiveMetrics(bin, binCollections, startDate, endDate)

          // Update bin with predictive data
          await this.binService.updateBin(bin._id, {
            historicalAvgFill: predictiveMetrics.avgFillLevel,
            collectionFrequency: predictiveMetrics.collectionFrequency,
            predictiveFillRate: predictiveMetrics.fillRate,
            priorityScore: predictiveMetrics.priorityScore
          })

          analysisResults.predictiveUpdates.push({
            binId: bin._id,
            sensorId: bin.sensorId,
            locationName: bin.locationName,
            collections: binCollections.length,
            predictiveMetrics
          })
        }
      }

      return analysisResults
    } catch (error) {
      throw new Error(`Failed to analyze historical data: ${error.message}`)
    }
  }

  /**
   * Calculate predictive metrics for a bin based on historical data
   * @param {Object} bin - Bin object
   * @param {Array} collections - Collections involving this bin
   * @param {Date} startDate - Analysis start date
   * @param {Date} endDate - Analysis end date
   * @returns {Object} Predictive metrics
   * @private
   */
  calculatePredictiveMetrics(bin, collections, startDate, endDate) {
    const daysDiff = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24))

    // Calculate collection frequency (collections per day)
    const collectionFrequency = collections.length / daysDiff

    // Calculate average fill level at collection time
    const avgFillLevel = collections.reduce((sum, collection) => {
      // Find this bin's fill level at collection time
      // For now, use current fill level as approximation
      return sum + bin.fillLevel
    }, 0) / collections.length

    // Calculate fill rate (percentage per hour)
    // Assuming bins fill at a constant rate between collections
    const fillRate = avgFillLevel / (24 / collectionFrequency) // percentage per hour

    // Calculate priority score (higher = more urgent)
    const priorityScore = this.calculatePriorityScore(bin, {
      collectionFrequency,
      avgFillLevel,
      fillRate
    })

    return {
      collectionFrequency: Math.round(collectionFrequency * 100) / 100,
      avgFillLevel: Math.round(avgFillLevel * 100) / 100,
      fillRate: Math.round(fillRate * 100) / 100,
      priorityScore: Math.round(priorityScore * 100) / 100
    }
  }

  /**
   * Calculate priority score for bin collection
   * @param {Object} bin - Bin object
   * @param {Object} metrics - Predictive metrics
   * @returns {number} Priority score
   * @private
   */
  calculatePriorityScore(bin, metrics) {
    let score = 0

    // Current fill level contribution (0-50 points)
    score += (bin.fillLevel / 100) * 50

    // Fill rate contribution (0-30 points)
    // Higher fill rate = higher priority
    score += Math.min(metrics.fillRate * 10, 30)

    // Collection frequency contribution (0-20 points)
    // Lower frequency = higher priority (bins that don't get collected often)
    const frequencyScore = Math.max(0, 20 - metrics.collectionFrequency * 5)
    score += frequencyScore

    return Math.min(score, 100) // Cap at 100
  }

  /**
   * Generate predictive routes based on historical data
   * @param {Object} options - Route generation options
   * @returns {Promise<Object>} Predictive route plan
   */
  async generatePredictiveRoutes(options = {}) {
    try {
      const predictionDays = options.predictionDays || 7
      const minPriorityThreshold = options.minPriorityThreshold || 60

      // Get all bins with predictive data
      const allBins = await this.binService.getAllBinsWithStatus()

      // Filter bins that need predictive collection
      const binsNeedingCollection = allBins.filter(bin => {
        // Always include 100% bins (highest priority)
        if (bin.fillLevel >= 100) return true

        // Calculate predicted fill level after prediction days
        const predictedFillLevel = bin.fillLevel + (bin.predictiveFillRate * 24 * predictionDays)

        // Check if bin will exceed threshold or has high priority score
        return predictedFillLevel >= 80 || bin.priorityScore >= minPriorityThreshold
      })

      if (binsNeedingCollection.length === 0) {
        return {
          message: 'No bins require collection based on predictive analysis',
          routes: [],
          predictionDays,
          binsAnalyzed: allBins.length
        }
      }

      // Sort by priority: 100% bins first, then by priority score descending
      binsNeedingCollection.sort((a, b) => {
        // 100% bins always come first
        if (a.fillLevel >= 100 && b.fillLevel < 100) return -1
        if (a.fillLevel < 100 && b.fillLevel >= 100) return 1

        // For bins with same 100% status, sort by priority score
        return b.priorityScore - a.priorityScore
      })

      // Allocate trucks using predictive data
      const allocation = await this.truckAllocationService.allocateTrucksForBins(
        binsNeedingCollection.map(bin => bin._id),
        {
          depotLocation: options.depotLocation || 'Kilinochchi Town',
          maxBinsPerTruck: options.maxBinsPerTruck || 6 // Fewer bins for predictive routes
        }
      )

      return {
        predictionDays,
        binsAnalyzed: allBins.length,
        binsNeedingCollection: binsNeedingCollection.length,
        routes: allocation.allocation.routes,
        efficiency: allocation.efficiency,
        predictiveInsights: this.generatePredictiveInsights(binsNeedingCollection)
      }
    } catch (error) {
      throw new Error(`Failed to generate predictive routes: ${error.message}`)
    }
  }

  /**
   * Generate predictive insights from bin data
   * @param {Array} bins - Array of bins needing collection
   * @returns {Object} Predictive insights
   * @private
   */
  generatePredictiveInsights(bins) {
    const insights = {
      highRiskBins: bins.filter(bin => bin.priorityScore >= 80).length,
      mediumRiskBins: bins.filter(bin => bin.priorityScore >= 60 && bin.priorityScore < 80).length,
      avgFillRate: bins.reduce((sum, bin) => sum + bin.predictiveFillRate, 0) / bins.length,
      avgCollectionFrequency: bins.reduce((sum, bin) => sum + bin.collectionFrequency, 0) / bins.length,
      binsByLocation: {}
    }

    // Group by location
    bins.forEach(bin => {
      if (!insights.binsByLocation[bin.locationName]) {
        insights.binsByLocation[bin.locationName] = []
      }
      insights.binsByLocation[bin.locationName].push({
        sensorId: bin.sensorId,
        priorityScore: bin.priorityScore,
        predictiveFillRate: bin.predictiveFillRate
      })
    })

    // Round averages
    insights.avgFillRate = Math.round(insights.avgFillRate * 100) / 100
    insights.avgCollectionFrequency = Math.round(insights.avgCollectionFrequency * 100) / 100

    return insights
  }

  /**
   * Get predictive report for dashboard
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Predictive report
   */
  async getPredictiveReport(days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Analyze historical data
      const analysis = await this.analyzeHistoricalData(startDate, endDate)

      // Generate predictive routes
      const predictiveRoutes = await this.generatePredictiveRoutes({
        predictionDays: 3, // Predict for next 3 days
        minPriorityThreshold: 70
      })

      // Get bin statistics
      const binStats = await this.binService.getBinStatistics()

      return {
        analysisPeriod: { start: startDate, end: endDate, days },
        historicalAnalysis: analysis,
        predictiveRoutes,
        binStatistics: binStats,
        recommendations: this.generateRecommendations(analysis, predictiveRoutes)
      }
    } catch (error) {
      throw new Error(`Failed to generate predictive report: ${error.message}`)
    }
  }

  /**
   * Generate recommendations based on analysis and predictions
   * @param {Object} analysis - Historical analysis results
   * @param {Object} predictions - Predictive route results
   * @returns {Array} Recommendations array
   * @private
   */
  generateRecommendations(analysis, predictions) {
    const recommendations = []

    if (predictions.binsNeedingCollection > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${predictions.binsNeedingCollection} bins predicted to need collection in the next ${predictions.predictionDays} days`,
        action: 'Schedule predictive collection routes'
      })
    }

    if (analysis.predictiveUpdates.length > 0) {
      const avgFrequency = analysis.predictiveUpdates.reduce((sum, update) =>
        sum + update.predictiveMetrics.collectionFrequency, 0) / analysis.predictiveUpdates.length

      if (avgFrequency < 0.5) {
        recommendations.push({
          type: 'optimization',
          message: 'Average collection frequency is low. Consider increasing collection rounds.',
          action: 'Review collection schedule'
        })
      }
    }

    if (predictions.predictiveInsights.highRiskBins > 0) {
      recommendations.push({
        type: 'high_priority',
        message: `${predictions.predictiveInsights.highRiskBins} high-risk bins identified`,
        action: 'Prioritize high-risk bins in next collection'
      })
    }

    return recommendations
  }

  /**
   * Update bin collection data after a collection is completed
   * @param {string} binId - Bin ID
   * @param {Date} collectionDate - Date of collection
   * @returns {Promise<Object>} Updated bin data
   */
  async updateBinAfterCollection(binId, collectionDate) {
    try {
      const bin = await this.binService.getBinById(binId)

      // Update collection tracking
      const updateData = {
        lastCollectionDate: collectionDate,
        fillLevel: 0 // Reset fill level after collection
      }

      // Recalculate collection frequency if we have previous data
      if (bin.lastCollectionDate) {
        const daysSinceLastCollection = (collectionDate - bin.lastCollectionDate) / (1000 * 60 * 60 * 24)
        const newFrequency = 1 / daysSinceLastCollection // collections per day

        // Update frequency using moving average
        updateData.collectionFrequency = bin.collectionFrequency
          ? (bin.collectionFrequency + newFrequency) / 2
          : newFrequency
      }

      return await this.binService.updateBin(binId, updateData)
    } catch (error) {
      throw new Error(`Failed to update bin after collection: ${error.message}`)
    }
  }
}

module.exports = PredictiveRoutingService