/**
 * Base Controller class
 * Provides common functionality for all controllers
 * Implements centralized error handling and dependency injection
 */
class BaseController {
  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {Object} res - Express response object
   */
  handleError(error, res) {
    console.error(`Error in ${this.constructor.name}:`, error)

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message })
    }

    if (error.message === 'User not found' || error.message === 'Bin not found' ||
        error.message === 'Truck not found' || error.message === 'Collection not found' ||
        error.message === 'Route plan not found' || error.message === 'Report not found') {
      return res.status(404).json({ error: error.message })
    }

    if (error.message.includes('already exists') || error.message.includes('required') ||
        error.message.includes('must be') || error.message.includes('cannot') ||
        error.message.includes('Valid location') || error.message.includes('inactive')) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = BaseController