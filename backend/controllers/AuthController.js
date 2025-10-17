/**
 * Controller layer for Authentication operations
 * Handles HTTP requests and responses for authentication endpoints
 * Validates input, calls AuthService, and formats responses
 * Follows the Controller pattern for clean request handling
 */
const BaseController = require('./BaseController')
const AuthService = require('../services/AuthService')

class AuthController extends BaseController {
  constructor(authService = null) {
    super()
    this.authService = authService || new AuthService()
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
      }

      const result = await this.authService.login(username, password)
      res.json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id
      const user = await this.authService.getCurrentUser(userId)
      res.json({ user })
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Register admin user (initial setup only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async registerAdmin(req, res) {
    try {
      const { username, password, name } = req.body

      if (!username || !password || !name) {
        return res.status(400).json({ error: 'Username, password, and name are required' })
      }

      const result = await this.authService.registerAdmin({ username, password, name })
      res.status(201).json(result)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  /**
   * Get authentication middleware
   * @returns {Function} Authentication middleware function
   */
  authenticateMiddleware() {
    return this.authService.authenticateMiddleware()
  }

  /**
   * Get authorization middleware
   * @param {string|string[]} roles - Required role(s)
   * @returns {Function} Authorization middleware function
   */
  authorizeMiddleware(roles) {
    return this.authService.authorizeMiddleware(roles)
  }
}

module.exports = AuthController