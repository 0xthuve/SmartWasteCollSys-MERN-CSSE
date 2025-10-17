/**
 * Service layer for Truck Allocation operations
 * Contains business logic for intelligent truck-to-bin assignment
 * Considers fuel consumption, distance, and minimum truck optimization
 * Follows the Service pattern for separation of concerns
 */
const TruckService = require('./TruckService')
const BinService = require('./BinService')
const RouteOptimizerService = require('./RouteOptimizerService').RouteOptimizerService

class TruckAllocationService {
  constructor() {
    this.truckService = new TruckService()
    this.binService = new BinService()
    this.routeOptimizer = new RouteOptimizerService()
  }

  /**
   * Allocate trucks for a set of bins considering fuel constraints
   * @param {Array} binIds - Array of bin IDs to collect
   * @param {Object} options - Allocation options
   * @returns {Promise<Object>} Allocation result with truck assignments and routes
   */
  async allocateTrucksForBins(binIds, options = {}) {
    try {
      // Validate input
      if (!Array.isArray(binIds) || binIds.length === 0) {
        throw new Error('Bin IDs array is required and cannot be empty')
      }

      // Get bins data
      const bins = []
      for (const binId of binIds) {
        const bin = await this.binService.getBinById(binId)
        bins.push(bin)
      }

      // Get active trucks with fuel information
      const activeTrucks = await this.truckService.getActiveTrucks()

      if (activeTrucks.length === 0) {
        throw new Error('No active trucks available for allocation')
      }

      // Filter trucks with sufficient fuel
      const eligibleTrucks = this.filterTrucksByFuel(activeTrucks, bins, options.depotLocation || 'Kilinochchi Town')

      if (eligibleTrucks.length === 0) {
        throw new Error('No trucks have sufficient fuel for the collection routes')
      }

      // Calculate optimal allocation
      const allocation = this.calculateOptimalAllocation(bins, eligibleTrucks, options)

      return {
        allocation,
        totalBins: bins.length,
        totalTrucks: allocation.routes.length,
        efficiency: this.calculateAllocationEfficiency(allocation)
      }
    } catch (error) {
      throw new Error(`Failed to allocate trucks: ${error.message}`)
    }
  }

  /**
   * Filter trucks that have sufficient fuel for collection routes
   * @param {Array} trucks - Array of truck objects
   * @param {Array} bins - Array of bin objects
   * @param {string} depotLocation - Depot location
   * @returns {Array} Filtered trucks with sufficient fuel
   * @private
   */
  filterTrucksByFuel(trucks, bins, depotLocation) {
    return trucks.filter(truck => {
      // Calculate maximum possible route distance for this truck
      const maxRouteDistance = this.calculateMaxRouteDistance(truck, bins.length)

      // Check if truck has enough fuel
      const requiredFuel = maxRouteDistance / truck.fuelEfficiency
      return truck.currentFuelLevel >= requiredFuel
    })
  }

  /**
   * Calculate maximum possible route distance for a truck
   * @param {Object} truck - Truck object
   * @param {number} totalBins - Total number of bins
   * @returns {number} Maximum route distance in km
   * @private
   */
  calculateMaxRouteDistance(truck, totalBins) {
    // Assume maximum 10 bins per truck for safety
    const maxBinsPerTruck = Math.min(totalBins, 10)
    const avgDistancePerBin = 15 // km (conservative estimate)
    const returnTripMultiplier = 2 // Round trip

    return maxBinsPerTruck * avgDistancePerBin * returnTripMultiplier
  }

  /**
   * Calculate optimal truck allocation using priority-based assignment
   * Priority: 100% bins get dedicated trucks, then 70%+ bins assigned by distance
   * @param {Array} bins - Array of bin objects
   * @param {Array} trucks - Array of eligible truck objects
   * @param {Object} options - Allocation options
   * @returns {Object} Allocation result
   * @private
   */
  calculateOptimalAllocation(bins, trucks, options) {
    const depotLocation = options.depotLocation || 'Kilinochchi Town'

    // Use RouteOptimizerService for coordinate-based allocation
    const routes = this.routeOptimizer.optimizeMultiRoute(bins, trucks, depotLocation)

    // Convert routes to allocation format and add fuel consumption
    const allocationRoutes = routes.map(route => {
      const truck = trucks.find(t => t._id === route.truckId)
      const fuelConsumption = route.totalDistance / truck.fuelEfficiency

      return {
        truckId: route.truckId,
        truckPlate: route.truckPlate,
        bins: route.stops.map(stop => ({
          binId: bins.find(b => b.sensorId === stop.sensorId)?._id,
          sensorId: stop.sensorId,
          locationName: stop.locationName,
          fillLevel: bins.find(b => b.sensorId === stop.sensorId)?.fillLevel || 0
        })).filter(bin => bin.binId), // Filter out any bins that couldn't be matched
        route: route.stops.map(stop => stop.locationName),
        totalDistance: route.totalDistance,
        fuelConsumption: Math.round(fuelConsumption * 100) / 100,
        estimatedTime: route.estimatedTimeMin,
        isPriority: route.priorityRoute
      }
    })

    return { routes: allocationRoutes }
  }

  /**
   * Filter trucks that have sufficient fuel for collection routes
   * @param {Array} trucks - Array of truck objects
   * @param {Array} bins - Array of bin objects
   * @param {string} depotLocation - Depot location
   * @returns {Array} Filtered trucks with sufficient fuel
   * @private
   */
  filterTrucksByFuel(trucks, bins, depotLocation) {
    return trucks.filter(truck => {
      // Calculate maximum possible route distance for this truck
      const maxRouteDistance = this.calculateMaxRouteDistance(truck, bins.length)

      // Check if truck has enough fuel
      const requiredFuel = maxRouteDistance / truck.fuelEfficiency
      return truck.currentFuelLevel >= requiredFuel
    })
  }

  /**
   * Calculate allocation efficiency metrics
   * @param {Object} allocation - Allocation result
   * @returns {Object} Efficiency metrics
   * @private
   */
  calculateAllocationEfficiency(allocation) {
    const totalDistance = allocation.routes.reduce((sum, route) => sum + route.totalDistance, 0)
    const totalFuel = allocation.routes.reduce((sum, route) => sum + route.fuelConsumption, 0)
    const totalTime = allocation.routes.reduce((sum, route) => sum + route.estimatedTime, 0)
    const avgDistancePerTruck = totalDistance / allocation.routes.length
    const avgFuelPerTruck = totalFuel / allocation.routes.length

    return {
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalFuelConsumption: Math.round(totalFuel * 100) / 100,
      totalEstimatedTime: totalTime,
      averageDistancePerTruck: Math.round(avgDistancePerTruck * 100) / 100,
      averageFuelPerTruck: Math.round(avgFuelPerTruck * 100) / 100,
      truckUtilization: allocation.routes.length
    }
  }

  /**
   * Get truck allocation recommendations for a specific scenario
   * @param {Array} binIds - Array of bin IDs
   * @param {Object} constraints - Allocation constraints
   * @returns {Promise<Object>} Recommendations with multiple allocation options
   */
  async getAllocationRecommendations(binIds, constraints = {}) {
    try {
      const recommendations = []

      // Get base allocation
      const baseAllocation = await this.allocateTrucksForBins(binIds, constraints)
      recommendations.push({
        name: 'Optimal Fuel Efficiency',
        allocation: baseAllocation,
        priority: 'fuel'
      })

      // Try different max bins per truck
      const alternativeMaxBins = [5, 10, 15]
      for (const maxBins of alternativeMaxBins) {
        try {
          const altAllocation = await this.allocateTrucksForBins(binIds, {
            ...constraints,
            maxBinsPerTruck: maxBins
          })
          recommendations.push({
            name: `Max ${maxBins} bins per truck`,
            allocation: altAllocation,
            priority: 'capacity'
          })
        } catch (error) {
          // Skip invalid configurations
          continue
        }
      }

      return {
        recommendations: recommendations.sort((a, b) => a.allocation.efficiency.totalFuelConsumption - b.allocation.efficiency.totalFuelConsumption),
        bestRecommendation: recommendations[0]
      }
    } catch (error) {
      throw new Error(`Failed to get allocation recommendations: ${error.message}`)
    }
  }

  /**
   * Validate truck fuel levels before allocation
   * @param {string} truckId - Truck ID to validate
   * @param {number} estimatedDistance - Estimated route distance
   * @returns {Promise<Object>} Validation result
   */
  async validateTruckFuel(truckId, estimatedDistance) {
    try {
      const truck = await this.truckService.getTruckById(truckId)

      if (truck.status !== 'Active') {
        return { valid: false, reason: 'Truck is not active' }
      }

      const requiredFuel = estimatedDistance / truck.fuelEfficiency
      const hasEnoughFuel = truck.currentFuelLevel >= requiredFuel

      return {
        valid: hasEnoughFuel,
        currentFuel: truck.currentFuelLevel,
        requiredFuel: Math.round(requiredFuel * 100) / 100,
        fuelEfficiency: truck.fuelEfficiency,
        reason: hasEnoughFuel ? null : 'Insufficient fuel for estimated route'
      }
    } catch (error) {
      throw new Error(`Failed to validate truck fuel: ${error.message}`)
    }
  }
}

module.exports = TruckAllocationService