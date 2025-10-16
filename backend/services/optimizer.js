// Simple route optimization service
// Uses nearest neighbor algorithm for TSP approximation

class RouteOptimizer {
  // Distance matrix for locations in Kilinochchi District (approximate distances in km)
  static distanceMatrix = {
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
    // Add more locations as needed, for brevity, assuming symmetric and filling with approximate values
    // For demo, I'll add a few more key ones
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
    // For other locations, assume distance to Kilinochchi Town as base, but for simplicity, this is partial
    // In real implementation, fill the entire matrix
  }

  // Get distance between two locations
  static getDistance(loc1, loc2) {
    if (this.distanceMatrix[loc1] && this.distanceMatrix[loc1][loc2] !== undefined) {
      return this.distanceMatrix[loc1][loc2]
    }
    if (this.distanceMatrix[loc2] && this.distanceMatrix[loc2][loc1] !== undefined) {
      return this.distanceMatrix[loc2][loc1]
    }
    // Default distance if not found
    return 10 // km
  }

  // Nearest neighbor algorithm for route optimization
  static optimizeRoute(startLocation, bins) {
    if (bins.length === 0) return { route: [startLocation], totalDistance: 0 }

    const route = [startLocation] // Start from depot or truck location
    let currentLocation = startLocation
    let remainingBins = [...bins]
    let totalDistance = 0

    while (remainingBins.length > 0) {
      let nearestIndex = 0
      let nearestDistance = this.getDistance(currentLocation, remainingBins[0].locationName)

      for (let i = 1; i < remainingBins.length; i++) {
        const distance = this.getDistance(currentLocation, remainingBins[i].locationName)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      const nearestBin = remainingBins[nearestIndex]
      route.push(nearestBin.locationName)
      totalDistance += nearestDistance
      currentLocation = nearestBin.locationName
      remainingBins.splice(nearestIndex, 1)
    }

    // Return to start if needed
    if (route.length > 1) {
      totalDistance += this.getDistance(currentLocation, startLocation)
      route.push(startLocation) // Return to depot
    }

    return { route, totalDistance }
  }

  // Optimize routes for multiple trucks with priority system
  static optimizeMultiRoute(bins, trucks, depotLocation = 'Kilinochchi Town') {
    // Filter bins that need collection (>70% fill level)
    const binsNeedingCollection = bins.filter(b => b.fillLevel > 70)

    // Separate priority bins (100% full) from regular bins (>70% but <100%)
    const priorityBins = binsNeedingCollection.filter(b => b.fillLevel >= 100)
    const regularBins = binsNeedingCollection.filter(b => b.fillLevel > 70 && b.fillLevel < 100)

    // Get active trucks
    const activeTrucks = trucks.filter(t => t.status === 'Active')

    const routes = []

    // If there are priority bins, all trucks go to priority bins first
    if (priorityBins.length > 0) {
      // Sort priority bins by fill level (highest first)
      priorityBins.sort((a, b) => b.fillLevel - a.fillLevel)

      activeTrucks.forEach((truck) => {
        const truckLocation = truck.currentLocation || depotLocation

        // Find nearest priority bins for this truck
        const sortedPriorityBins = [...priorityBins].sort((a, b) =>
          this.getDistance(truckLocation, a.locationName) - this.getDistance(truckLocation, b.locationName)
        )

        // Take up to 3 priority bins per truck
        const truckPriorityBins = sortedPriorityBins.splice(0, Math.min(3, sortedPriorityBins.length))

        if (truckPriorityBins.length > 0) {
          const { route, totalDistance } = this.optimizeRoute(truckLocation, truckPriorityBins)

          const stops = route
            .filter(loc => loc !== truckLocation || route.indexOf(loc) > 0)
            .map((locationName, index) => {
              const bin = truckPriorityBins.find(b => b.locationName === locationName)
              return {
                sensorId: bin ? bin.sensorId : null,
                order: index + 1,
                estimatedTime: Math.round(totalDistance / route.length * 10),
                locationName,
                priority: true
              }
            }).filter(stop => stop.sensorId)

          routes.push({
            truckId: truck._id,
            truckPlate: truck.plate,
            binSensorIds: truckPriorityBins.map(b => b.sensorId),
            stops,
            totalDistance: Math.round(totalDistance * 100) / 100,
            estimatedTimeMin: Math.round(totalDistance * 6),
            status: 'planned',
            priorityRoute: true
          })

          // Remove assigned priority bins from the pool
          truckPriorityBins.forEach(assignedBin => {
            const index = priorityBins.findIndex(b => b.sensorId === assignedBin.sensorId)
            if (index > -1) priorityBins.splice(index, 1)
          })
        }
      })
    }

    // Handle remaining regular bins (>70% but <100%) if no priority bins or after priority bins are handled
    let remainingBins = priorityBins.length > 0 ? [] : regularBins

    if (remainingBins.length > 0) {
      // Sort by distance from depot/truck locations
      activeTrucks.forEach((truck) => {
        if (remainingBins.length === 0) return

        const truckLocation = truck.currentLocation || depotLocation
        remainingBins.sort((a, b) =>
          this.getDistance(truckLocation, a.locationName) - this.getDistance(truckLocation, b.locationName)
        )

        // Take bins for this truck (up to 5)
        const binsPerTruck = Math.min(remainingBins.length, 5)
        const truckBins = remainingBins.splice(0, binsPerTruck)

        if (truckBins.length > 0) {
          const { route, totalDistance } = this.optimizeRoute(truckLocation, truckBins)

          const stops = route
            .filter(loc => loc !== truckLocation || route.indexOf(loc) > 0)
            .map((locationName, index) => {
              const bin = truckBins.find(b => b.locationName === locationName)
              return {
                sensorId: bin ? bin.sensorId : null,
                order: index + 1,
                estimatedTime: Math.round(totalDistance / route.length * 10),
                locationName,
                priority: false
              }
            }).filter(stop => stop.sensorId)

          routes.push({
            truckId: truck._id,
            truckPlate: truck.plate,
            binSensorIds: truckBins.map(b => b.sensorId),
            stops,
            totalDistance: Math.round(totalDistance * 100) / 100,
            estimatedTimeMin: Math.round(totalDistance * 6),
            status: 'planned',
            priorityRoute: false
          })
        }
      })
    }

    return routes
  }

  // Calculate efficiency metrics
  static calculateEfficiency(routes, originalRoutes = null) {
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
}

module.exports = RouteOptimizer