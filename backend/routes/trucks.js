/**
 * Routes for Truck operations
 * Defines REST API endpoints for truck management
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper error handling
 */
const express = require('express')
const router = express.Router()
const TruckController = require('../controllers/TruckController')
const AuthController = require('../controllers/AuthController')

// Initialize controllers
const truckController = new TruckController()
const authController = new AuthController()

// Middleware for authentication
const authenticate = authController.authenticateMiddleware()

// GET /api/trucks - Get all trucks
router.get('/', authenticate, truckController.getAllTrucks.bind(truckController))

// POST /api/trucks - Create a new truck
router.post('/', authenticate, truckController.createTruck.bind(truckController))

// PUT /api/trucks/:id - Update a truck
router.put('/:id', authenticate, truckController.updateTruck.bind(truckController))

// DELETE /api/trucks/:id - Delete a truck
router.delete('/:id', authenticate, truckController.deleteTruck.bind(truckController))

// PUT /api/trucks/:id/location - Update truck location
router.put('/:id/location', authenticate, truckController.updateTruckLocation.bind(truckController))

// GET /api/trucks/:id - Get a specific truck by ID
router.get('/:id', authenticate, truckController.getTruckById.bind(truckController))

// GET /api/trucks/status/:status - Get trucks by status
router.get('/status/:status', authenticate, truckController.getTrucksByStatus.bind(truckController))

// GET /api/trucks/active - Get active trucks
router.get('/active', authenticate, truckController.getActiveTrucks.bind(truckController))

// GET /api/trucks/stats - Get truck statistics
router.get('/stats', authenticate, truckController.getTruckStatistics.bind(truckController))

module.exports = router
