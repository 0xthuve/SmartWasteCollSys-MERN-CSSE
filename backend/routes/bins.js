/**
 * Routes for Bin operations
 * Defines REST API endpoints for waste bin management
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper error handling
 */
const express = require('express')
const router = express.Router()
const BinController = require('../controllers/BinController')
const AuthController = require('../controllers/AuthController')

// Initialize controllers
const binController = new BinController()
const authController = new AuthController()

// Middleware for authentication
const authenticate = authController.authenticateMiddleware()

// GET /api/bins - Get all bins
router.get('/', authenticate, binController.getAllBins.bind(binController))

// POST /api/bins - Create a new bin
router.post('/', authenticate, binController.createBin.bind(binController))

// PUT /api/bins/:id - Update a bin
router.put('/:id', authenticate, binController.updateBin.bind(binController))

// DELETE /api/bins/:id - Delete a bin
router.delete('/:id', authenticate, binController.deleteBin.bind(binController))

// POST /api/bins/report - Report bin fill level from sensor
router.post('/report', binController.reportFillLevel.bind(binController))

// POST /api/bins/seed - Seed bins from data (development only)
router.post('/seed', authenticate, binController.seedBins.bind(binController))

// GET /api/bins/needing-collection - Get bins that need collection
router.get('/needing-collection', authenticate, binController.getBinsNeedingCollection.bind(binController))

// GET /api/bins/priority - Get priority bins (100% full)
router.get('/priority', authenticate, binController.getPriorityBins.bind(binController))

// GET /api/bins/:id - Get a specific bin by ID
router.get('/:id', authenticate, binController.getBinById.bind(binController))

// GET /api/bins/stats - Get bin statistics
router.get('/stats', authenticate, binController.getBinStatistics.bind(binController))

module.exports = router
