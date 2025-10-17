/**
 * Data Access Object for User entity
 * Handles all database operations related to user authentication and management
 * Follows the DAO pattern for clean separation of data access logic
 */
const User = require('../models/User')

class UserDAO {
  /**
   * Find all users with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, etc.)
   * @returns {Promise<Array>} Array of user documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const query = User.find(filter).select('-password') // Exclude password by default

      if (options.sort) {
        query.sort(options.sort)
      }

      if (options.limit) {
        query.limit(options.limit)
      }

      return await query.exec()
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`)
    }
  }

  /**
   * Find a user by ID (excludes password)
   * @param {string} id - User document ID
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findById(id) {
    try {
      return await User.findById(id).select('-password')
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`)
    }
  }

  /**
   * Find a user by username (includes password for authentication)
   * @param {string} username - User's username
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findByUsername(username) {
    try {
      return await User.findOne({ username })
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error.message}`)
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user document
   */
  async create(userData) {
    try {
      const user = new User(userData)
      return await user.save()
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }
  }

  /**
   * Update a user by ID
   * @param {string} id - User document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated user document or null if not found
   */
  async updateById(id, updateData, options = { new: true }) {
    try {
      return await User.findByIdAndUpdate(id, updateData, options).select('-password')
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  /**
   * Delete a user by ID
   * @param {string} id - User document ID
   * @returns {Promise<Object|null>} Deleted user document or null if not found
   */
  async deleteById(id) {
    try {
      return await User.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Find users by role
   * @param {string} role - User role (admin, operator, etc.)
   * @returns {Promise<Array>} Array of users with the specified role
   */
  async findByRole(role) {
    try {
      return await User.find({ role }).select('-password')
    } catch (error) {
      throw new Error(`Failed to find users by role: ${error.message}`)
    }
  }

  /**
   * Count users matching a filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of matching users
   */
  async count(filter = {}) {
    try {
      return await User.countDocuments(filter)
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`)
    }
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username exists, false otherwise
   */
  async usernameExists(username) {
    try {
      const count = await User.countDocuments({ username })
      return count > 0
    } catch (error) {
      throw new Error(`Failed to check username existence: ${error.message}`)
    }
  }
}

module.exports = UserDAO