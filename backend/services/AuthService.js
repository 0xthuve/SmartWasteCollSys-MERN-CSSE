/**
 * Service layer for Authentication operations
 * Contains business logic for user authentication and authorization
 * Coordinates between UserDAO and JWT operations
 * Follows the Service pattern for separation of concerns
 */
const UserDAO = require('../daos/UserDAO')
const jwt = require('jsonwebtoken')

class AuthService {
  constructor(userDAO = null) {
    this.userDAO = userDAO || new UserDAO()
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret_change_in_production'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h'
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result with token and user data
   */
  async login(username, password) {
    try {
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // Find user by username
      const user = await this.userDAO.findByUsername(username)
      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw new Error('Invalid credentials')
      }

      // Generate JWT token
      const token = this.generateToken(user)

      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
  }

  /**
   * Verify JWT token and get user information
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User information
   */
  async verifyToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret)

      // Get user from database
      const user = await this.userDAO.findById(decoded.id)
      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`)
    }
  }

  /**
   * Register a new admin user (initial setup only)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user information
   */
  async registerAdmin(userData) {
    try {
      // Validate input
      this.validateRegistrationData(userData)

      // Check if any users already exist
      const existingUsersCount = await this.userDAO.count()
      if (existingUsersCount > 0) {
        throw new Error('Admin user already exists. Registration is disabled.')
      }

      // Create admin user
      const adminData = {
        ...userData,
        role: 'admin'
      }

      const user = await this.userDAO.create(adminData)

      return {
        message: 'Admin user created successfully',
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`)
    }
  }

  /**
   * Get current user information
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User information
   */
  async getCurrentUser(userId) {
    try {
      const user = await this.userDAO.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    } catch (error) {
      throw new Error(`Failed to get current user: ${error.message}`)
    }
  }

  /**
   * Check if user has required role
   * @param {string} userId - User ID
   * @param {string|string[]} requiredRoles - Required role(s)
   * @returns {Promise<boolean>} True if user has required role
   */
  async hasRole(userId, requiredRoles) {
    try {
      const user = await this.userDAO.findById(userId)
      if (!user) {
        return false
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      return roles.includes(user.role)
    } catch (error) {
      return false
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   * @private
   */
  generateToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    }

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn })
  }

  /**
   * Validate registration data
   * @param {Object} userData - User data to validate
   * @private
   */
  validateRegistrationData(userData) {
    if (!userData.username || typeof userData.username !== 'string' || userData.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 1) {
      throw new Error('Name is required')
    }

    // Check for valid username format (alphanumeric, underscore, dash)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(userData.username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and dashes')
    }
  }

  /**
   * Middleware function to authenticate requests
   * @returns {Function} Express middleware function
   */
  authenticateMiddleware() {
    return async (req, res, next) => {
      try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
          return res.status(401).json({ error: 'Access denied. No token provided.' })
        }

        const user = await this.verifyToken(token)
        req.user = user
        next()
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
      }
    }
  }

  /**
   * Middleware function to authorize requests based on roles
   * @param {string|string[]} roles - Required role(s)
   * @returns {Function} Express middleware function
   */
  authorizeMiddleware(roles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const hasRequiredRole = await this.hasRole(req.user.id, roles)
        if (!hasRequiredRole) {
          return res.status(403).json({ error: 'Insufficient permissions' })
        }

        next()
      } catch (error) {
        return res.status(500).json({ error: 'Authorization check failed' })
      }
    }
  }
}

module.exports = AuthService