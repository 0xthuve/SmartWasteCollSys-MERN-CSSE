const express = require('express')
const router = express.Router()
const Report = require('../models/Report')
const RoutePlan = require('../models/RoutePlan')
const Bin = require('../models/Bin')
const { authenticate } = require('./auth')

// GET /api/reports - list reports
router.get('/', authenticate, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reports/generate - generate a report
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate report based on type
    let reportData = {}

    if (type === 'efficiency') {
      // Calculate efficiency metrics from completed routes
      const completedRoutes = await RoutePlan.find({
        dispatchedAt: { $gte: start, $lte: end },
        'routes.status': 'completed'
      })

      let totalTimeSaved = 0
      let totalDistanceSaved = 0
      let totalFuelSaved = 0

      completedRoutes.forEach(plan => {
        totalTimeSaved += plan.efficiency?.timeSaved || 0
        totalDistanceSaved += plan.efficiency?.distanceSaved || 0
        totalFuelSaved += plan.efficiency?.fuelSaved || 0
      })

      reportData = {
        totalCollections: completedRoutes.length,
        efficiency: {
          timeSaved: totalTimeSaved,
          distanceSaved: totalDistanceSaved,
          fuelSaved: totalFuelSaved
        }
      }
    } else {
      // For daily/weekly/monthly reports
      const routePlans = await RoutePlan.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('routes.truckId')

      const bins = await Bin.find()

      reportData = {
        totalCollections: routePlans.filter(p => p.dispatchedAt).length,
        totalBinsEmptied: routePlans.reduce((sum, p) => sum + p.routes.reduce((rSum, r) => rSum + r.binSensorIds.length, 0), 0),
        averageFillLevel: bins.reduce((sum, b) => sum + b.fillLevel, 0) / bins.length,
        truckUtilization: [], // Would need more complex aggregation
        binPerformance: bins.map(b => ({
          sensorId: b.sensorId,
          location: b.location,
          averageFillRate: b.historicalAvgFill,
          collectionFrequency: 1, // Simplified
          overflowIncidents: b.fillLevel > 90 ? 1 : 0
        }))
      }
    }

    const report = new Report({
      type,
      period: { start, end },
      data: reportData
    })

    await report.save()
    res.status(201).json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/reports/:id - get specific report
router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router