/**
 * Service layer for Route Optimization operations
 * Contains business logic for optimizing waste collection routes
 * Uses configurable distance data and strategy pattern for algorithms
 * Follows the Service pattern and Strategy pattern for clean architecture
 */

// Strategy interface for route optimization algorithms
class RouteOptimizationStrategy {
  /**
   * Optimize route for given bins and starting location
   * @param {string} startLocation - Starting location name
   * @param {Array} bins - Array of bin objects
   * @returns {Object} Optimized route with route array and total distance
   */
  optimizeRoute(startLocation, bins) {
    throw new Error('optimizeRoute must be implemented by subclass')
  }
}

// Nearest Neighbor optimization strategy with priority support
class NearestNeighborStrategy extends RouteOptimizationStrategy {
  constructor(distanceProvider) {
    super()
    this.distanceProvider = distanceProvider
  }

  optimizeRoute(startLocation, bins) {
    if (bins.length === 0) {
      return { route: [startLocation], totalDistance: 0 }
    }

    const route = [startLocation]
    let currentLocation = startLocation
    let remainingBins = [...bins]
    let totalDistance = 0

    // For priority routes, ensure 100% bins are collected first
    // Sort remaining bins by priority (100% first), then by distance
    const sortBinsByPriority = (binsToSort) => {
      return binsToSort.sort((a, b) => {
        // 100% bins always come first
        if (a.fillLevel >= 100 && b.fillLevel < 100) return -1
        if (a.fillLevel < 100 && b.fillLevel >= 100) return 1

        // For bins with same priority level, sort by distance
        const distA = this.distanceProvider.getDistance(currentLocation, a.locationName)
        const distB = this.distanceProvider.getDistance(currentLocation, b.locationName)
        return distA - distB
      })
    }

    while (remainingBins.length > 0) {
      // Sort remaining bins by priority and distance
      sortBinsByPriority(remainingBins)

      // Pick the first bin (highest priority, or closest if same priority)
      const nearestBin = remainingBins[0]
      const nearestDistance = this.distanceProvider.getDistance(currentLocation, nearestBin.locationName)

      // Only add to route if it's not the same as current location (to avoid duplicates)
      if (nearestBin.locationName !== currentLocation) {
        route.push(nearestBin.locationName)
      }
      totalDistance += nearestDistance
      currentLocation = nearestBin.locationName
      remainingBins.shift() // Remove the first element
    }

    // Return to start if needed
    if (route.length > 1) {
      totalDistance += this.distanceProvider.getDistance(currentLocation, startLocation)
      route.push(startLocation)
    }

    return { route, totalDistance }
  }
}

// Distance provider interface
class DistanceProvider {
  /**
   * Get distance between two locations
   * @param {string} loc1 - First location
   * @param {string} loc2 - Second location
   * @returns {number} Distance in kilometers
   */
  getDistance(loc1, loc2) {
    throw new Error('getDistance must be implemented by subclass')
  }
}

// Kilinochchi district distance provider with configurable data
class KilinochchiDistanceProvider extends DistanceProvider {
  constructor(distanceData = null) {
    super()
    // Default distance matrix for Kilinochchi District (approximate distances in km)
    this.distanceMatrix = distanceData || {
      'Paranthan': {
        'Paranthan': 0, 'Poonagary': 5, 'Kilinochchi Town': 10, 'Ramanathapuram': 15, 'Uruthirapuram': 8,
        'Akkarayankulam': 12, 'Mulankavil': 18, 'Pallai': 20, 'Kandawalai': 25, 'Murikandy': 7,
        'Thiruvaiaru': 22, 'Nachchikuda': 14, 'Anaivilunthan': 16, 'Puthukudiyiruppu': 9, 'Jayapuram': 11,
        'Elephant Pass': 30, 'Iranamadu': 35, 'Mankulam': 40, 'Puliyankulam': 28, 'Vavuniya Road': 45,
        'Oddusuddan': 50, 'Kanakapuram': 55, 'Karachchi': 60, 'Mallavi': 65, 'Thunukkai': 70
      },
      'Poonagary': {
        'Paranthan': 5, 'Poonagary': 0, 'Kilinochchi Town': 8, 'Ramanathapuram': 12, 'Uruthirapuram': 6,
        'Akkarayankulam': 10, 'Mulankavil': 15, 'Pallai': 18, 'Kandawalai': 22, 'Murikandy': 4,
        'Thiruvaiaru': 20, 'Nachchikuda': 12, 'Anaivilunthan': 14, 'Puthukudiyiruppu': 7, 'Jayapuram': 9,
        'Elephant Pass': 28, 'Iranamadu': 33, 'Mankulam': 38, 'Puliyankulam': 26, 'Vavuniya Road': 43,
        'Oddusuddan': 48, 'Kanakapuram': 53, 'Karachchi': 58, 'Mallavi': 63, 'Thunukkai': 68
      },
      'Kilinochchi Town': {
        'Paranthan': 10, 'Poonagary': 8, 'Kilinochchi Town': 0, 'Ramanathapuram': 6, 'Uruthirapuram': 4,
        'Akkarayankulam': 5, 'Mulankavil': 10, 'Pallai': 12, 'Kandawalai': 15, 'Murikandy': 6,
        'Thiruvaiaru': 14, 'Nachchikuda': 8, 'Anaivilunthan': 10, 'Puthukudiyiruppu': 3, 'Jayapuram': 5,
        'Elephant Pass': 25, 'Iranamadu': 30, 'Mankulam': 35, 'Puliyankulam': 23, 'Vavuniya Road': 40,
        'Oddusuddan': 45, 'Kanakapuram': 50, 'Karachchi': 55, 'Mallavi': 60, 'Thunukkai': 65
      },
      'Akkarayankulam': {
        'Paranthan': 12, 'Poonagary': 10, 'Kilinochchi Town': 5, 'Ramanathapuram': 8, 'Uruthirapuram': 6,
        'Akkarayankulam': 0, 'Mulankavil': 8, 'Pallai': 10, 'Kandawalai': 12, 'Murikandy': 8,
        'Thiruvaiaru': 15, 'Nachchikuda': 5, 'Anaivilunthan': 7, 'Puthukudiyiruppu': 4, 'Jayapuram': 3,
        'Elephant Pass': 20, 'Iranamadu': 25, 'Mankulam': 30, 'Puliyankulam': 18, 'Vavuniya Road': 35,
        'Oddusuddan': 40, 'Kanakapuram': 45, 'Karachchi': 50, 'Mallavi': 55, 'Thunukkai': 60
      },
      'Murikandy': {
        'Paranthan': 7, 'Poonagary': 4, 'Kilinochchi Town': 6, 'Ramanathapuram': 10, 'Uruthirapuram': 5,
        'Akkarayankulam': 8, 'Mulankavil': 12, 'Pallai': 15, 'Kandawalai': 18, 'Murikandy': 0,
        'Thiruvaiaru': 16, 'Nachchikuda': 10, 'Anaivilunthan': 12, 'Puthukudiyiruppu': 6, 'Jayapuram': 8,
        'Elephant Pass': 25, 'Iranamadu': 30, 'Mankulam': 35, 'Puliyankulam': 23, 'Vavuniya Road': 40,
        'Oddusuddan': 45, 'Kanakapuram': 50, 'Karachchi': 55, 'Mallavi': 60, 'Thunukkai': 65
      }
    }

    // Location coordinates for Haversine distance calculation
    this.locationCoordinates = {
      'Paranthan': { lat: 9.4297, lng: 80.3683 },
      'Poonagary': { lat: 9.4850, lng: 80.2350 },
      'Kilinochchi Town': { lat: 9.3850, lng: 80.3980 },
      'Ramanathapuram': { lat: 9.3780, lng: 80.4180 },
      'Uruthirapuram': { lat: 9.3950, lng: 80.3850 },
      'Akkarayankulam': { lat: 9.3750, lng: 80.4050 },
      'Mulankavil': { lat: 9.3650, lng: 80.4150 },
      'Pallai': { lat: 9.4550, lng: 80.3250 },
      'Kandawalai': { lat: 9.4450, lng: 80.3350 },
      'Murikandy': { lat: 9.4750, lng: 80.2450 },
      'Thiruvaiaru': { lat: 9.4650, lng: 80.3150 },
      'Nachchikuda': { lat: 9.3650, lng: 80.4250 },
      'Anaivilunthan': { lat: 9.3550, lng: 80.4350 },
      'Puthukudiyiruppu': { lat: 9.3900, lng: 80.4000 },
      'Jayapuram': { lat: 9.3700, lng: 80.4100 },
      'Elephant Pass': { lat: 9.4850, lng: 80.4850 },
      'Iranamadu': { lat: 9.4950, lng: 80.4950 },
      'Mankulam': { lat: 9.5050, lng: 80.5050 },
      'Puliyankulam': { lat: 9.4750, lng: 80.4750 },
      'Vavuniya Road': { lat: 9.5150, lng: 80.5150 },
      'Oddusuddan': { lat: 9.5250, lng: 80.5250 },
      'Kanakapuram': { lat: 9.5350, lng: 80.5350 },
      'Karachchi': { lat: 9.5450, lng: 80.5450 },
      'Mallavi': { lat: 9.5550, lng: 80.5550 },
      'Thunukkai': { lat: 9.5650, lng: 80.5650 }
    }
  }

  getDistance(loc1, loc2) {
    // Check direct distance
    if (this.distanceMatrix[loc1] && this.distanceMatrix[loc1][loc2] !== undefined) {
      return this.distanceMatrix[loc1][loc2]
    }
    // Check reverse distance
    if (this.distanceMatrix[loc2] && this.distanceMatrix[loc2][loc1] !== undefined) {
      return this.distanceMatrix[loc2][loc1]
    }
    // Default distance if not found (could be improved with Haversine formula for coordinates)
    return 10
  }

  // Calculate Haversine distance between two coordinates
  getHaversineDistance(coord1, coord2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get distance between truck coordinates and bin location
  getDistanceFromCoordinates(truckCoords, binLocationName) {
    const binCoords = this.locationCoordinates[binLocationName]
    if (!binCoords) {
      // Fallback to depot distance if coordinates not found
      return this.getDistance('Kilinochchi Town', binLocationName)
    }
    return this.getHaversineDistance(truckCoords, binCoords)
  }

  // Get distance between two coordinate objects
  getDistanceBetweenCoordinates(coord1, coord2) {
    return this.getHaversineDistance(coord1, coord2)
  }

  // Get location coordinates by name
  getLocationCoordinates(locationName) {
    return this.locationCoordinates[locationName]
  }

  // Find closest location name to given coordinates
  getClosestLocationName(coordinates) {
    let closestLocation = null
    let closestDistance = Infinity

    for (const [locationName, locationCoords] of Object.entries(this.locationCoordinates)) {
      const distance = this.getHaversineDistance(coordinates, locationCoords)
      if (distance < closestDistance) {
        closestDistance = distance
        closestLocation = locationName
      }
    }

    return closestLocation || 'Kilinochchi Town' // Default fallback
  }

  // Add or update distance between locations
  setDistance(loc1, loc2, distance) {
    if (!this.distanceMatrix[loc1]) {
      this.distanceMatrix[loc1] = {}
    }
    this.distanceMatrix[loc1][loc2] = distance

    // Set reverse distance for symmetry
    if (!this.distanceMatrix[loc2]) {
      this.distanceMatrix[loc2] = {}
    }
    this.distanceMatrix[loc2][loc1] = distance
  }
}

// Main Route Optimizer service
class RouteOptimizerService {
  constructor(distanceProvider = null, optimizationStrategy = null) {
    this.distanceProvider = distanceProvider || new KilinochchiDistanceProvider()
    this.optimizationStrategy = optimizationStrategy || new NearestNeighborStrategy(this.distanceProvider)
  }

  /**
   * Optimize route for a single truck
   * @param {string} startLocation - Starting location
   * @param {Array} bins - Array of bin objects
   * @returns {Object} Optimized route with route array and total distance
   */
  optimizeRoute(startLocation, bins) {
    return this.optimizationStrategy.optimizeRoute(startLocation, bins)
  }

  /**
   * Optimize routes for multiple trucks with priority system
   * Priority: 100% bins get dedicated trucks, then 70%+ bins assigned by distance
   * @param {Array} bins - Array of bin objects
   * @param {Array} trucks - Array of truck objects
   * @param {string} depotLocation - Depot location name
   * @returns {Array} Array of optimized routes for each truck
   */
  optimizeMultiRoute(bins, trucks, depotLocation = 'Kilinochchi Town') {
    // Filter bins that need collection (>70% fill level)
    const binsNeedingCollection = bins.filter(bin => bin.fillLevel > 70)

    // Separate priority bins (100% full) from regular bins (>70% but <100%)
    const priorityBins = binsNeedingCollection.filter(bin => bin.fillLevel >= 100)
    const regularBins = binsNeedingCollection.filter(bin => bin.fillLevel > 70 && bin.fillLevel < 100)

    // Get active trucks
    const activeTrucks = trucks.filter(truck => truck.status === 'Active')

    const routes = []

    // Handle priority bins first - each 100% bin gets its own truck, but can pick up nearby regular bins
    if (priorityBins.length > 0) {
      this.assignPriorityBinsToTrucks(priorityBins, regularBins, activeTrucks, depotLocation, routes)
    }

    // Handle remaining regular bins with remaining trucks
    if (regularBins.length > 0) {
      const remainingTrucks = activeTrucks.filter(truck =>
        !routes.some(route => route.truckId === truck._id)
      )
      if (remainingTrucks.length > 0) {
        this.assignBinsToTrucks(regularBins, remainingTrucks, depotLocation, routes, false)
      }

      // If there are still regular bins left, assign them ONLY to non-priority routes
      // Priority routes (with 100% bins) should focus on priority collection only
      if (regularBins.length > 0) {
        const nonPriorityRoutes = routes.filter(route => !route.priorityRoute)
        if (nonPriorityRoutes.length > 0) {
          this.assignRemainingBinsToExistingRoutes(regularBins, nonPriorityRoutes, depotLocation, binsNeedingCollection)
        } else {
          // If no non-priority routes, assign to priority routes as last resort
          this.assignRemainingBinsToExistingRoutes(regularBins, routes, depotLocation, binsNeedingCollection)
        }
      }
    }

    return routes
  }

  /**
   * Assign priority bins (100% full) to trucks - one bin per truck, but collect ALL remaining 70%+ bins
   * @param {Array} priorityBins - Priority bins (100% full)
   * @param {Array} regularBins - Regular bins (>70%) to collect after priority bins
   * @param {Array} trucks - Available trucks
   * @param {string} depotLocation - Depot location
   * @param {Array} routes - Routes array to populate
   * @private
   */
  assignPriorityBinsToTrucks(priorityBins, regularBins, trucks, depotLocation, routes) {
    if (trucks.length === 1) {
      // Single truck scenario: collect ALL 100% bins first, then ALL 70%+ bins
      this.assignSingleTruckForAllBins(priorityBins, regularBins, trucks[0], depotLocation, routes)
    } else {
      // Multiple trucks scenario: assign trucks to closest 100% bins
      this.assignMultipleTrucksForPriorityBins(priorityBins, regularBins, trucks, depotLocation, routes)
    }
  }

  /**
   * Single truck collects ALL 100% bins first, then ALL 70%+ bins
   * @param {Array} priorityBins - All 100% bins
   * @param {Array} regularBins - All 70%+ bins
   * @param {Object} truck - The single truck
   * @param {string} depotLocation - Depot location
   * @param {Array} routes - Routes array to populate
   * @private
   */
  assignSingleTruckForAllBins(priorityBins, regularBins, truck, depotLocation, routes) {
    // Use depot location as starting point since truck coordinates aren't in distance matrix
    const truckLocation = depotLocation

    // Combine all priority bins (100%) and regular bins (70%+)
    let allBins = [...priorityBins, ...regularBins]

    // Clear regular bins since they're all being assigned to this truck
    regularBins.splice(0, regularBins.length)

    // Sort bins so that 100% bins come first, then by distance from depot
    allBins.sort((a, b) => {
      // 100% bins always come first
      if (a.fillLevel >= 100 && b.fillLevel < 100) return -1
      if (a.fillLevel < 100 && b.fillLevel >= 100) return 1

      // For bins with same priority level, sort by distance from depot
      const distA = this.distanceProvider.getDistance(truckLocation, a.locationName)
      const distB = this.distanceProvider.getDistance(truckLocation, b.locationName)
      return distA - distB
    })

    // Optimize route for all bins (100% bins first, then 70%+ bins in optimal order)
    const { route, totalDistance } = this.optimizeRoute(truckLocation, allBins)

    const stops = this.createStops(route, allBins, truckLocation, totalDistance, true)

    routes.push(this.createRouteObject(
      truck,
      allBins,
      stops,
      totalDistance,
      true // This is a priority route
    ))
  }

  /**
   * Multiple trucks: assign each truck to closest 100% bin, then remaining trucks handle 70%+ bins
   * @param {Array} priorityBins - All 100% bins
   * @param {Array} regularBins - All 70%+ bins
   * @param {Array} trucks - Available trucks
   * @param {string} depotLocation - Depot location
   * @param {Array} routes - Routes array to populate
   * @private
   */
  assignMultipleTrucksForPriorityBins(priorityBins, regularBins, trucks, depotLocation, routes) {
    let remainingPriorityBins = [...priorityBins]
    let assignedTrucks = []

    // Assign each priority bin to its closest available truck
    while (remainingPriorityBins.length > 0 && assignedTrucks.length < trucks.length) {
      let bestAssignment = null
      let bestDistance = Infinity

      // Find the best truck-bin assignment (closest truck to available bin)
      for (const truck of trucks) {
        if (assignedTrucks.includes(truck._id)) continue

        // Get truck coordinates from current location name
        const truckCoords = this.distanceProvider.getLocationCoordinates(truck.currentLocation || depotLocation)

        for (const bin of remainingPriorityBins) {
          const binCoords = this.distanceProvider.getLocationCoordinates(bin.locationName)
          if (binCoords && truckCoords) {
            const distance = this.distanceProvider.getDistanceBetweenCoordinates(truckCoords, binCoords)
            if (distance < bestDistance) {
              bestDistance = distance
              bestAssignment = { truck, bin, distance }
            }
          }
        }
      }

      if (!bestAssignment) break

      const { truck, bin } = bestAssignment

      // Use actual truck current location as starting point for route optimization
      const truckLocation = truck.currentLocation || depotLocation

      // Remove this bin from remaining priority bins
      const binIndex = remainingPriorityBins.findIndex(b => b._id === bin._id)
      if (binIndex !== -1) {
        remainingPriorityBins.splice(binIndex, 1)
      }

      // Create route for this truck with its assigned 100% bin
      const { route, totalDistance } = this.optimizeRoute(truckLocation, [bin])

      const stops = this.createStops(route, [bin], truckLocation, totalDistance, true)

      routes.push(this.createRouteObject(
        truck,
        [bin],
        stops,
        totalDistance,
        true // This is a priority route
      ))

      assignedTrucks.push(truck._id)
    }

    // Handle any remaining 100% bins that weren't assigned (if more bins than trucks)
    if (remainingPriorityBins.length > 0) {
      // Assign remaining bins to already assigned trucks based on proximity
      remainingPriorityBins.forEach(bin => {
        let bestRoute = null
        let bestDistance = Infinity

        routes.forEach(route => {
          // Calculate distance from route's last stop to this bin using coordinates
          const lastStop = route.stops[route.stops.length - 1]
          const lastStopCoords = this.distanceProvider.getLocationCoordinates(lastStop.locationName)
          const binCoords = this.distanceProvider.getLocationCoordinates(bin.locationName)

          if (lastStopCoords && binCoords) {
            const distance = this.distanceProvider.getDistanceBetweenCoordinates(lastStopCoords, binCoords)
            if (distance < bestDistance) {
              bestDistance = distance
              bestRoute = route
            }
          }
        })

        if (bestRoute) {
          // Add this bin to the existing route
          bestRoute.binSensorIds.push(bin.sensorId)
          bestRoute.stops.push({
            sensorId: bin.sensorId,
            order: bestRoute.stops.length + 1,
            estimatedTime: Math.round(bestRoute.totalDistance / bestRoute.stops.length * 10),
            locationName: bin.locationName,
            priority: false
          })

          // Re-optimize the route with the additional bin
          const truckLocation = depotLocation
          const routeBins = bestRoute.stops.map(stop => {
            const originalBin = remainingPriorityBins.find(b => b.sensorId === stop.sensorId) ||
                               priorityBins.find(b => b.sensorId === stop.sensorId)
            return originalBin || { locationName: stop.locationName, sensorId: stop.sensorId, fillLevel: 100 }
          })
          const { route: newRoute, totalDistance: newDistance } = this.optimizeRoute(truckLocation, routeBins)

          bestRoute.stops = this.createStops(newRoute, routeBins, truckLocation, newDistance, true)
          bestRoute.totalDistance = Math.round(newDistance * 100) / 100
          bestRoute.estimatedTimeMin = Math.round(newDistance * 6)
        }
      })
    }
  }

  /**
   * Assign bins to trucks using optimization strategy
   * @param {Array} bins - Bins to assign
   * @param {Array} trucks - Available trucks
   * @param {string} depotLocation - Depot location
   * @param {Array} routes - Routes array to populate
   * @param {boolean} isPriority - Whether these are priority bins
   * @private
   */
  assignBinsToTrucks(bins, trucks, depotLocation, routes, isPriority) {
    const maxBinsPerTruck = isPriority ? 3 : 5

    trucks.forEach(truck => {
      if (bins.length === 0) return

      // Use actual truck current location coordinates for distance calculations
      const truckCoords = this.distanceProvider.getLocationCoordinates(truck.currentLocation || depotLocation)
      const truckLocation = truck.currentLocation || depotLocation

      // Sort bins by coordinate-based distance from truck's current location
      bins.sort((a, b) => {
        const binACoords = this.distanceProvider.getLocationCoordinates(a.locationName)
        const binBCoords = this.distanceProvider.getLocationCoordinates(b.locationName)

        if (!binACoords || !binBCoords) {
          // Fallback to distance matrix if coordinates not available
          return this.distanceProvider.getDistance(truckLocation, a.locationName) -
                 this.distanceProvider.getDistance(truckLocation, b.locationName)
        }

        const distanceA = this.distanceProvider.getDistanceBetweenCoordinates(truckCoords, binACoords)
        const distanceB = this.distanceProvider.getDistanceBetweenCoordinates(truckCoords, binBCoords)
        return distanceA - distanceB
      })

      // Take bins for this truck
      const binsPerTruck = Math.min(bins.length, maxBinsPerTruck)
      const truckBins = bins.splice(0, binsPerTruck)

      if (truckBins.length > 0) {
        const { route, totalDistance } = this.optimizeRoute(truckLocation, truckBins)

        const stops = this.createStops(route, truckBins, truckLocation, totalDistance, isPriority)

        routes.push(this.createRouteObject(
          truck,
          truckBins,
          stops,
          totalDistance,
          isPriority
        ))
      }
    })
  }

  /**
   * Assign remaining bins to existing routes when no more trucks are available
   * @param {Array} remainingBins - Bins that still need to be assigned
   * @param {Array} routes - Existing routes to add bins to
   * @param {string} depotLocation - Depot location
   * @param {Array} allBins - All original bin data for reference
   * @private
   */
  assignRemainingBinsToExistingRoutes(remainingBins, routes, depotLocation, allBins) {
    remainingBins.forEach(bin => {
      let bestRoute = null
      let bestDistance = Infinity

      routes.forEach(route => {
        // Calculate distance from route's last stop to this bin using coordinates
        const lastStop = route.stops[route.stops.length - 1]
        const lastStopCoords = this.distanceProvider.getLocationCoordinates(lastStop.locationName)
        const binCoords = this.distanceProvider.getLocationCoordinates(bin.locationName)

        if (lastStopCoords && binCoords) {
          const distance = this.distanceProvider.getDistanceBetweenCoordinates(lastStopCoords, binCoords)
          if (distance < bestDistance) {
            bestDistance = distance
            bestRoute = route
          }
        } else {
          // Fallback to distance matrix
          const distance = this.distanceProvider.getDistance(lastStop.locationName, bin.locationName)
          if (distance < bestDistance) {
            bestDistance = distance
            bestRoute = route
          }
        }
      })

      if (bestRoute) {
        // Add this bin to the existing route
        bestRoute.binSensorIds.push(bin.sensorId)
        bestRoute.stops.push({
          sensorId: bin.sensorId,
          order: bestRoute.stops.length + 1,
          estimatedTime: Math.round(bestRoute.totalDistance / bestRoute.stops.length * 10),
          locationName: bin.locationName,
          priority: false
        })

        // Re-optimize the route with the additional bin
        const truck = routes.find(r => r.truckId === bestRoute.truckId)
        const truckLocation = depotLocation // Use depot as reference for re-optimization
        // Get the original bin data for all stops
        const routeBins = bestRoute.stops.map(stop => {
          const originalBin = allBins.find(b => b.sensorId === stop.sensorId)
          return originalBin || { locationName: stop.locationName, sensorId: stop.sensorId, fillLevel: 0 }
        })
        const { route: newRoute, totalDistance: newDistance } = this.optimizeRoute(truckLocation, routeBins)

        bestRoute.stops = this.createStops(newRoute, routeBins, truckLocation, newDistance, false)
        bestRoute.totalDistance = Math.round(newDistance * 100) / 100
        bestRoute.estimatedTimeMin = Math.round(newDistance * 6)
      }
    })

    // Clear the remaining bins array since they've all been assigned
    remainingBins.splice(0, remainingBins.length)
  }

  /**
   * Create stops array from route and bins
   * @param {Array} route - Route array
   * @param {Array} bins - Bin objects
   * @param {string} truckLocation - Truck starting location
   * @param {number} totalDistance - Total route distance
   * @param {boolean} isPriorityRoute - Whether this is a priority route
   * @returns {Array} Stops array
   * @private
   */
  createStops(route, bins, truckLocation, totalDistance, isPriorityRoute = false) {
    // Get unique locations from the route, excluding the starting location if it's not a bin
    const uniqueLocations = [...new Set(route)]
    const binLocations = bins.map(b => b.locationName)

    return uniqueLocations
      .filter(locationName => binLocations.includes(locationName)) // Only include locations that have bins
      .map((locationName, index) => {
        const bin = bins.find(b => b.locationName === locationName)
        const isPriority = bin ? bin.fillLevel >= 100 : false
        return {
          sensorId: bin ? bin.sensorId : null,
          order: index + 1,
          estimatedTime: Math.round(totalDistance / uniqueLocations.length * 10),
          locationName,
          priority: isPriority
        }
      })
      .filter(stop => stop.sensorId)
  }

  /**
   * Create route object
   * @param {Object} truck - Truck object
   * @param {Array} bins - Bin objects for this route
   * @param {Array} stops - Stops array
   * @param {number} totalDistance - Total distance
   * @param {boolean} isPriority - Whether this is a priority route
   * @returns {Object} Route object
   * @private
   */
  createRouteObject(truck, bins, stops, totalDistance, isPriority) {
    return {
      truckId: truck._id,
      truckPlate: truck.plate,
      binSensorIds: bins.map(b => b.sensorId),
      stops,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedTimeMin: Math.round(totalDistance * 6), // Assuming 10 km/h average speed
      status: 'planned',
      priorityRoute: isPriority
    }
  }

  /**
   * Calculate efficiency metrics
   * @param {Array} routes - Optimized routes
   * @param {Array} originalRoutes - Original routes for comparison (optional)
   * @returns {Object} Efficiency metrics
   */
  calculateEfficiency(routes, originalRoutes = null) {
    if (!originalRoutes) {
      // Estimate original inefficient routes
      const totalBins = routes.reduce((sum, r) => sum + r.binSensorIds.length, 0)
      const estimatedOriginalDistance = totalBins * 5 // Assume 5km per bin without optimization
      const estimatedOriginalTime = estimatedOriginalDistance * 6 // 10 km/h

      const optimizedDistance = routes.reduce((sum, r) => sum + r.totalDistance, 0)
      const optimizedTime = routes.reduce((sum, r) => sum + r.estimatedTimeMin, 0)

      return {
        timeSaved: Math.max(0, estimatedOriginalTime - optimizedTime),
        distanceSaved: Math.max(0, estimatedOriginalDistance - optimizedDistance),
        fuelSaved: Math.max(0, (estimatedOriginalDistance - optimizedDistance) * 0.08) // 8L per 100km
      }
    }

    return { timeSaved: 0, distanceSaved: 0, fuelSaved: 0 }
  }

  /**
   * Update distance data
   * @param {string} loc1 - First location
   * @param {string} loc2 - Second location
   * @param {number} distance - Distance in km
   */
  updateDistance(loc1, loc2, distance) {
    if (this.distanceProvider instanceof KilinochchiDistanceProvider) {
      this.distanceProvider.setDistance(loc1, loc2, distance)
    }
  }

  /**
   * Set optimization strategy
   * @param {RouteOptimizationStrategy} strategy - New optimization strategy
   */
  setOptimizationStrategy(strategy) {
    this.optimizationStrategy = strategy
  }
}

module.exports = {
  RouteOptimizerService,
  NearestNeighborStrategy,
  KilinochchiDistanceProvider
}