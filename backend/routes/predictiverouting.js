/**
 * Routes for Predictive Routing operations
 * Defines API endpoints for predictive analysis and route optimization
 * Uses PredictiveRoutingController for business logic
 * Follows RESTful API design patterns
 */
const express = require('express')
const PredictiveRoutingController = require('../controllers/PredictiveRoutingController')

const router = express.Router()
const controller = new PredictiveRoutingController()

// Analyze historical collection data
router.post('/analyze-history', (req, res) => controller.analyzeHistoricalData(req, res))

// Generate predictive routes based on historical data
router.post('/generate-routes', (req, res) => controller.generatePredictiveRoutes(req, res))

// Get predictive report for dashboard
router.get('/report', (req, res) => controller.getPredictiveReport(req, res))

// Update bin data after collection completion
router.post('/update-after-collection', (req, res) => controller.updateBinAfterCollection(req, res))

// Get predictive insights for specific bins
router.get('/insights', (req, res) => controller.getPredictiveInsights(req, res))

module.exports = router