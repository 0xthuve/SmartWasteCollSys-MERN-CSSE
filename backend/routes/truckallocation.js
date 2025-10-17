/**
 * Routes for Truck Allocation operations
 * Defines API endpoints for truck-to-bin allocation with fuel considerations
 * Uses TruckAllocationController for business logic
 * Follows RESTful API design patterns
 */
const express = require('express')
const TruckAllocationController = require('../controllers/TruckAllocationController')

const router = express.Router()
const controller = new TruckAllocationController()

// Allocate trucks for collection based on bin IDs
router.post('/allocate', (req, res) => controller.allocateTrucks(req, res))

// Get allocation recommendations for different scenarios
router.post('/recommendations', (req, res) => controller.getAllocationRecommendations(req, res))

// Validate truck fuel levels for a route
router.get('/validate-fuel/:truckId', (req, res) => controller.validateTruckFuel(req, res))

// Get allocation statistics and insights
router.get('/stats', (req, res) => controller.getAllocationStats(req, res))

module.exports = router