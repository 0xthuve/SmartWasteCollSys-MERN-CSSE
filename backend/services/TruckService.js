/**
 * Service layer for Truck operations
 * Contains business logic for truck management
 * Coordinates between TruckDAO and other services
 * Follows the Service pattern for separation of concerns
 */
const TruckDAO = require('../daos/TruckDAO')

class TruckService {
  constructor() {
    this.truckDAO = new TruckDAO()
  }

  /**
   * Get all trucks with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of truck objects
   */
  async getAllTrucks(filter = {}, options = {}) {
    try {
      return await this.truckDAO.findAll(filter, { sort: { createdAt: -1 }, ...options })
    } catch (error) {
      throw new Error(`Failed to retrieve trucks: ${error.message}`)
    }
  }

  /**
   * Get a truck by ID
   * @param {string} id - Truck ID
   * @returns {Promise<Object|null>} Truck object or null if not found
   */
  async getTruckById(id) {
    try {
      const truck = await this.truckDAO.findById(id)
      if (!truck) {
        throw new Error('Truck not found')
      }
      return truck
    } catch (error) {
      throw new Error(`Failed to retrieve truck: ${error.message}`)
    }
  }

  /**
   * Get a truck by plate number
   * @param {string} plate - Truck plate number
   * @returns {Promise<Object|null>} Truck object or null if not found
   */
  async getTruckByPlate(plate) {
    try {
      const truck = await this.truckDAO.findByPlate(plate)
      if (!truck) {
        throw new Error('Truck not found')
      }
      return truck
    } catch (error) {
      throw new Error(`Failed to retrieve truck by plate: ${error.message}`)
    }
  }

  /**
   * Create a new truck
   * @param {Object} truckData - Truck data
   * @returns {Promise<Object>} Created truck object
   */
  async createTruck(truckData) {
    try {
      // Validate required fields
      this.validateTruckData(truckData)

      // Check if plate number already exists
      const existingTruck = await this.truckDAO.findByPlate(truckData.plate)
      if (existingTruck) {
        throw new Error('Truck with this plate number already exists')
      }

      // Set default values
      const truckToCreate = {
        ...truckData,
        status: truckData.status || 'Inactive',
        currentLocation: truckData.currentLocation || null
      }

      return await this.truckDAO.create(truckToCreate)
    } catch (error) {
      throw new Error(`Failed to create truck: ${error.message}`)
    }
  }

  /**
   * Update a truck
   * @param {string} id - Truck ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated truck object
   */
  async updateTruck(id, updateData) {
    try {
      // Validate the truck exists
      const existingTruck = await this.truckDAO.findById(id)
      if (!existingTruck) {
        throw new Error('Truck not found')
      }

      // If plate is being updated, check for uniqueness
      if (updateData.plate && updateData.plate !== existingTruck.plate) {
        const duplicateTruck = await this.truckDAO.findByPlate(updateData.plate)
        if (duplicateTruck) {
          throw new Error('Truck with this plate number already exists')
        }
      }

      return await this.truckDAO.updateById(id, updateData)
    } catch (error) {
      throw new Error(`Failed to update truck: ${error.message}`)
    }
  }

  /**
   * Delete a truck
   * @param {string} id - Truck ID
   * @returns {Promise<Object>} Deleted truck object
   */
  async deleteTruck(id) {
    try {
      const deletedTruck = await this.truckDAO.deleteById(id)
      if (!deletedTruck) {
        throw new Error('Truck not found')
      }
      return deletedTruck
    } catch (error) {
      throw new Error(`Failed to delete truck: ${error.message}`)
    }
  }

  /**
   * Update truck location
   * @param {string} id - Truck ID
   * @param {Object} location - New location coordinates
   * @returns {Promise<Object>} Updated truck object
   */
  async updateTruckLocation(id, location) {
    try {
      // Validate the truck exists and is active
      const truck = await this.truckDAO.findById(id)
      if (!truck) {
        throw new Error('Truck not found')
      }

      if (truck.status !== 'Active') {
        throw new Error('Cannot update location for inactive truck')
      }

      // Validate location data
      if (!location || typeof location !== 'object') {
        throw new Error('Valid location data is required')
      }

      return await this.truckDAO.updateLocation(id, location)
    } catch (error) {
      throw new Error(`Failed to update truck location: ${error.message}`)
    }
  }

  /**
   * Get active trucks
   * @returns {Promise<Array>} Array of active trucks
   */
  async getActiveTrucks() {
    try {
      return await this.truckDAO.findByStatus('Active')
    } catch (error) {
      throw new Error(`Failed to get active trucks: ${error.message}`)
    }
  }

  /**
   * Get trucks by status
   * @param {string} status - Truck status
   * @returns {Promise<Array>} Array of trucks with the specified status
   */
  async getTrucksByStatus(status) {
    try {
      return await this.truckDAO.findByStatus(status)
    } catch (error) {
      throw new Error(`Failed to get trucks by status: ${error.message}`)
    }
  }

  /**
   * Get truck statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getTruckStatistics() {
    try {
      const totalTrucks = await this.truckDAO.count()
      const activeTrucks = await this.truckDAO.count({ status: 'Active' })
      const inactiveTrucks = await this.truckDAO.count({ status: 'Inactive' })
      const maintenanceTrucks = await this.truckDAO.count({ status: 'Maintenance' })

      return {
        total: totalTrucks,
        active: activeTrucks,
        inactive: inactiveTrucks,
        maintenance: maintenanceTrucks
      }
    } catch (error) {
      throw new Error(`Failed to get truck statistics: ${error.message}`)
    }
  }

  /**
   * Update truck fuel level
   * @param {string} id - Truck ID
   * @param {number} fuelLevel - New fuel level in liters
   * @returns {Promise<Object>} Updated truck object
   */
  async updateTruckFuelLevel(id, fuelLevel) {
    try {
      // Validate the truck exists
      const existingTruck = await this.truckDAO.findById(id)
      if (!existingTruck) {
        throw new Error('Truck not found')
      }

      // Validate fuel level
      if (fuelLevel < 0 || fuelLevel > existingTruck.fuelCapacity) {
        throw new Error(`Fuel level must be between 0 and ${existingTruck.fuelCapacity} liters`)
      }

      return await this.truckDAO.updateById(id, { currentFuelLevel: fuelLevel })
    } catch (error) {
      throw new Error(`Failed to update truck fuel level: ${error.message}`)
    }
  }

  /**
   * Get trucks with sufficient fuel for a given distance
   * @param {number} distance - Distance in km
   * @returns {Promise<Array>} Array of trucks with sufficient fuel
   */
  async getTrucksWithSufficientFuel(distance) {
    try {
      const allActiveTrucks = await this.getActiveTrucks()
      return allActiveTrucks.filter(truck => {
        const requiredFuel = distance / truck.fuelEfficiency
        return truck.currentFuelLevel >= requiredFuel
      })
    } catch (error) {
      throw new Error(`Failed to get trucks with sufficient fuel: ${error.message}`)
    }
  }

  /**
   * Calculate fuel consumption for a route
   * @param {string} truckId - Truck ID
   * @param {number} distance - Distance in km
   * @returns {Promise<Object>} Fuel consumption details
   */
  async calculateFuelConsumption(truckId, distance) {
    try {
      const truck = await this.getTruckById(truckId)

      const fuelConsumption = distance / truck.fuelEfficiency
      const hasEnoughFuel = truck.currentFuelLevel >= fuelConsumption

      return {
        truckId,
        truckPlate: truck.plate,
        distance,
        fuelConsumption: Math.round(fuelConsumption * 100) / 100,
        currentFuelLevel: truck.currentFuelLevel,
        fuelEfficiency: truck.fuelEfficiency,
        hasEnoughFuel,
        remainingFuel: hasEnoughFuel ? Math.round((truck.currentFuelLevel - fuelConsumption) * 100) / 100 : 0
      }
    } catch (error) {
      throw new Error(`Failed to calculate fuel consumption: ${error.message}`)
    }
  }

  /**
   * Validate truck data
   * @param {Object} truckData - Truck data to validate
   * @private
   */
  validateTruckData(truckData) {
    if (!truckData.plate || typeof truckData.plate !== 'string') {
      throw new Error('Plate number is required and must be a string')
    }

    if (!truckData.model || typeof truckData.model !== 'string') {
      throw new Error('Model is required and must be a string')
    }

    if (!truckData.capacity || typeof truckData.capacity !== 'number' || truckData.capacity <= 0) {
      throw new Error('Capacity is required and must be a positive number')
    }

    // Validate fuel-related fields
    if (truckData.fuelCapacity !== undefined && (typeof truckData.fuelCapacity !== 'number' || truckData.fuelCapacity <= 0)) {
      throw new Error('Fuel capacity must be a positive number')
    }

    if (truckData.currentFuelLevel !== undefined && (typeof truckData.currentFuelLevel !== 'number' || truckData.currentFuelLevel < 0)) {
      throw new Error('Current fuel level must be a non-negative number')
    }

    if (truckData.fuelEfficiency !== undefined && (typeof truckData.fuelEfficiency !== 'number' || truckData.fuelEfficiency <= 0)) {
      throw new Error('Fuel efficiency must be a positive number')
    }

    // Validate status if provided
    const validStatuses = ['Active', 'Inactive', 'Maintenance']
    if (truckData.status && !validStatuses.includes(truckData.status)) {
      throw new Error('Status must be one of: Active, Inactive, Maintenance')
    }

    // Validate plate number format (basic validation)
    const plateRegex = /^[A-Z]{2,3}-\d{4}$|^[A-Z]{1,3}\d{4}[A-Z]{0,2}$/i
    if (!plateRegex.test(truckData.plate)) {
      throw new Error('Plate number format is invalid')
    }
  }
}

module.exports = TruckService