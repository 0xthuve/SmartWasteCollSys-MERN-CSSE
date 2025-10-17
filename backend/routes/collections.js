/**
 * Routes for Collection operations
 * Defines REST API endpoints for waste collection records
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper error handling
 */
const express = require('express')
const router = express.Router()
const CollectionController = require('../controllers/CollectionController')
const AuthController = require('../controllers/AuthController')

// Initialize controllers
const collectionController = new CollectionController()
const authController = new AuthController()

// Middleware for authentication
const authenticate = authController.authenticateMiddleware()

// GET /api/collections - Get all collection records
router.get('/', authenticate, collectionController.getAllCollections.bind(collectionController))

// POST /api/collections - Create a new collection record
router.post('/', authenticate, collectionController.createCollection.bind(collectionController))

// GET /api/collections/:id - Get a specific collection by ID
router.get('/:id', authenticate, collectionController.getCollectionById.bind(collectionController))

// PUT /api/collections/:id - Update a collection record
router.put('/:id', authenticate, collectionController.updateCollection.bind(collectionController))

// DELETE /api/collections/:id - Delete a collection record
router.delete('/:id', authenticate, collectionController.deleteCollection.bind(collectionController))

// GET /api/collections/bin/:binId - Get collections for a specific bin
router.get('/bin/:binId', authenticate, collectionController.getCollectionsByBin.bind(collectionController))

// GET /api/collections/truck/:truckId - Get collections for a specific truck
router.get('/truck/:truckId', authenticate, collectionController.getCollectionsByTruck.bind(collectionController))

// GET /api/collections/date-range - Get collections within a date range
router.get('/date-range', authenticate, collectionController.getCollectionsByDateRange.bind(collectionController))

// GET /api/collections/stats - Get collection statistics
router.get('/stats', authenticate, collectionController.getCollectionStatistics.bind(collectionController))

module.exports = router
