/**
 * Routes for Route Plan operations
 * Defines REST API endpoints for route planning and optimization
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper error handling
 */
const express = require('express')
const router = express.Router()
const RoutePlanController = require('../controllers/RoutePlanController')
const AuthController = require('../controllers/AuthController')

// Initialize controllers
const routePlanController = new RoutePlanController()
const authController = new AuthController()

// Middleware for authentication
const authenticate = authController.authenticateMiddleware()

// GET /api/routeplans - Get all route plans
router.get('/', authenticate, routePlanController.getAllRoutePlans.bind(routePlanController))

// POST /api/routeplans/generate - Generate a new route plan
router.post('/generate', authenticate, routePlanController.generateRoutePlan.bind(routePlanController))

// POST /api/routeplans/:id/approve - Approve a route plan
router.post('/:id/approve', authenticate, routePlanController.approveRoutePlan.bind(routePlanController))

// POST /api/routeplans/:id/dispatch - Dispatch a route plan
router.post('/:id/dispatch', authenticate, routePlanController.dispatchRoutePlan.bind(routePlanController))

// POST /api/routeplans/:id/complete - Complete a route plan
router.post('/:id/complete', authenticate, routePlanController.completeRoutePlan.bind(routePlanController))

// DELETE /api/routeplans/:id - Delete a route plan
router.delete('/:id', authenticate, routePlanController.deleteRoutePlan.bind(routePlanController))

// GET /api/routeplans/:id - Get a specific route plan by ID
router.get('/:id', authenticate, routePlanController.getRoutePlanById.bind(routePlanController))

// GET /api/routeplans/status/:status - Get route plans by status
router.get('/status/:status', authenticate, routePlanController.getRoutePlansByStatus.bind(routePlanController))

// GET /api/routeplans/range - Get route plans by date range
router.get('/range', authenticate, routePlanController.getRoutePlansByDateRange.bind(routePlanController))

// GET /api/routeplans/stats - Get route plan statistics
router.get('/stats', authenticate, routePlanController.getRoutePlanStatistics.bind(routePlanController))

module.exports = router
