const express = require('express')
const router = express.Router()
const Bin = require('../models/Bin')
const RoutePlan = require('../models/RoutePlan')
const Truck = require('../models/Truck')
const RouteOptimizer = require('../services/optimizer')
const { authenticate } = require('./auth')

// GET /api/routeplans - list
router.get('/', authenticate, async (req, res) => {
  try {
    const plans = await RoutePlan.find().sort({ createdAt: -1 }).populate('routes.truckId')
    res.json(plans)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/routeplans/generate - generate a plan. body: { mode: 'real-time'|'predictive' }
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { mode } = req.body

    // Get bins and trucks
    const bins = await Bin.find()
    const trucks = await Truck.find({ status: 'Active' })

    if (trucks.length === 0) {
      return res.status(400).json({ error: 'No active trucks available' })
    }

    // Filter bins based on mode
    let filteredBins = []
    if (mode === 'real-time') {
      filteredBins = bins.filter(b => b.fillLevel > 70)
    } else {
      // Predictive: use historical averages or current fill levels
      filteredBins = bins.filter(b => b.historicalAvgFill > 60 || b.fillLevel > 50)
    }

    if (filteredBins.length === 0) {
      return res.status(400).json({ error: 'No bins require collection' })
    }

    // Optimize routes
    const routes = RouteOptimizer.optimizeMultiRoute(filteredBins, trucks, 'Kilinochchi Town')

    // Sanitize routes to prevent NaN values
    const sanitizedRoutes = routes.map(route => ({
      ...route,
      stops: route.stops.map(stop => ({
        ...stop,
        estimatedTime: isNaN(stop.estimatedTime) ? 0 : stop.estimatedTime
      })),
      totalDistance: isNaN(route.totalDistance) ? 0 : route.totalDistance,
      estimatedTimeMin: isNaN(route.estimatedTimeMin) ? 0 : route.estimatedTimeMin
    }))

    // Calculate efficiency
    const efficiency = RouteOptimizer.calculateEfficiency(sanitizedRoutes)

    const sanitizedEfficiency = {
      timeSaved: isNaN(efficiency.timeSaved) ? 0 : efficiency.timeSaved,
      distanceSaved: isNaN(efficiency.distanceSaved) ? 0 : efficiency.distanceSaved,
      fuelSaved: isNaN(efficiency.fuelSaved) ? 0 : efficiency.fuelSaved
    }

    const plan = new RoutePlan({
      mode,
      routes: sanitizedRoutes,
      efficiency: sanitizedEfficiency
    })

    await plan.save()

    // Populate truck details
    await plan.populate('routes.truckId')

    res.status(201).json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/routeplans/:id/approve - approve plan
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    const plan = await RoutePlan.findByIdAndUpdate(req.params.id, { approved: true }, { new: true })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/routeplans/:id/dispatch - mock dispatch (sets dispatchedAt)
router.post('/:id/dispatch', authenticate, async (req, res) => {
  try {
    const plan = await RoutePlan.findByIdAndUpdate(req.params.id, { dispatchedAt: new Date() }, { new: true })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })

    // Update route statuses
    plan.routes.forEach(route => route.status = 'dispatched')
    await plan.save()

    // Emit notification to drivers (would integrate with mobile app)
    req.app.get('io').emit('routeDispatched', {
      planId: plan._id,
      routes: plan.routes
    })

    res.json({ success: true, dispatchedAt: plan.dispatchedAt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/routeplans/:id/complete - mark route as completed
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const plan = await RoutePlan.findByIdAndUpdate(
      req.params.id,
      {
        completedAt: new Date(),
        'routes.$[].status': 'completed'
      },
      { new: true }
    )
    if (!plan) return res.status(404).json({ error: 'Plan not found' })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/routeplans/kilinochchi - list routes in Kilinochchi district
router.get('/kilinochchi', authenticate, async (req, res) => {
  try {
    const plans = await RoutePlan.find()
      .sort({ createdAt: -1 })
      .populate('routes.truckId')
    res.json(plans)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
