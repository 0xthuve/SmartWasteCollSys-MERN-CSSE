/**
 * Routes for Authentication operations
 * Defines REST API endpoints for user authentication and authorization
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper security practices
 */
const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/AuthController')

// Initialize controller
const authController = new AuthController()

// POST /api/auth/login - User login
router.post('/login', authController.login.bind(authController))

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', authController.authenticateMiddleware(), authController.getCurrentUser.bind(authController))

// POST /api/auth/register - Register admin user (initial setup only)
router.post('/register', authController.registerAdmin.bind(authController))

module.exports = { router }