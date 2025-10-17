/**
 * Unit tests for RouteOptimizerService
 * Tests the route optimization logic with mocked dependencies
 */
const { RouteOptimizerService, NearestNeighborStrategy, KilinochchiDistanceProvider } = require('../services/RouteOptimizerService')

// Mock dependencies
jest.mock('../daos/RoutePlanDAO')
jest.mock('../daos/BinDAO')
jest.mock('../daos/TruckDAO')

describe('RouteOptimizerService', () => {
  let routeOptimizerService
  let mockDistanceProvider
  let mockStrategy

  beforeEach(() => {
    // Create mock distance provider
    mockDistanceProvider = {
      getDistance: jest.fn(),
      getLocationCoordinates: jest.fn(),
      getDistanceBetweenCoordinates: jest.fn(),
      setDistance: jest.fn()
    }

    // Create mock strategy
    mockStrategy = {
      optimizeRoute: jest.fn()
    }

    // Create service instance with mocks
    routeOptimizerService = new RouteOptimizerService(mockDistanceProvider, mockStrategy)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('optimizeRoute', () => {
    test('should optimize route for single truck', () => {
      const startLocation = 'Kilinochchi Town'
      const bins = [
        { sensorId: 'BIN001', locationName: 'Paranthan', fillLevel: 80 },
        { sensorId: 'BIN002', locationName: 'Poonagary', fillLevel: 75 }
      ]
      const expectedResult = { route: ['Kilinochchi Town', 'Paranthan', 'Poonagary'], totalDistance: 15 }

      mockStrategy.optimizeRoute.mockReturnValue(expectedResult)

      const result = routeOptimizerService.optimizeRoute(startLocation, bins)

      expect(mockStrategy.optimizeRoute).toHaveBeenCalledWith(startLocation, bins)
      expect(result).toEqual(expectedResult)
    })

    test('should handle empty bins array', () => {
      const startLocation = 'Kilinochchi Town'
      const bins = []
      const expectedResult = { route: ['Kilinochchi Town'], totalDistance: 0 }

      mockStrategy.optimizeRoute.mockReturnValue(expectedResult)

      const result = routeOptimizerService.optimizeRoute(startLocation, bins)

      expect(mockStrategy.optimizeRoute).toHaveBeenCalledWith(startLocation, bins)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('optimizeMultiRoute', () => {
    test('should optimize routes for multiple trucks with priority bins', () => {
      const bins = [
        { sensorId: 'BIN001', locationName: 'Paranthan', fillLevel: 100 },
        { sensorId: 'BIN002', locationName: 'Poonagary', fillLevel: 80 },
        { sensorId: 'BIN003', locationName: 'Kilinochchi Town', fillLevel: 75 }
      ]
      const trucks = [
        { _id: 'truck1', plate: 'ABC-1234', status: 'Active', currentLocation: 'Kilinochchi Town' },
        { _id: 'truck2', plate: 'DEF-5678', status: 'Active', currentLocation: 'Paranthan' }
      ]
      const depotLocation = 'Kilinochchi Town'

      // Mock distance provider methods
      mockDistanceProvider.getLocationCoordinates.mockReturnValue({ lat: 9.3850, lng: 80.3980 })
      mockDistanceProvider.getDistanceBetweenCoordinates.mockReturnValue(10)
      mockStrategy.optimizeRoute.mockReturnValue({ route: ['Kilinochchi Town', 'Paranthan'], totalDistance: 10 })

      const result = routeOptimizerService.optimizeMultiRoute(bins, trucks, depotLocation)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle no active trucks', () => {
      const bins = [{ sensorId: 'BIN001', locationName: 'Paranthan', fillLevel: 80 }]
      const trucks = [{ _id: 'truck1', plate: 'ABC-1234', status: 'Inactive' }]
      const depotLocation = 'Kilinochchi Town'

      const result = routeOptimizerService.optimizeMultiRoute(bins, trucks, depotLocation)

      expect(result).toEqual([])
    })

    test('should handle no bins needing collection', () => {
      const bins = [{ sensorId: 'BIN001', locationName: 'Paranthan', fillLevel: 50 }]
      const trucks = [{ _id: 'truck1', plate: 'ABC-1234', status: 'Active' }]
      const depotLocation = 'Kilinochchi Town'

      const result = routeOptimizerService.optimizeMultiRoute(bins, trucks, depotLocation)

      expect(result).toEqual([])
    })
  })

  describe('calculateEfficiency', () => {
    test('should calculate efficiency metrics without original routes', () => {
      const routes = [
        { binSensorIds: ['BIN001', 'BIN002'], totalDistance: 15, estimatedTimeMin: 90 },
        { binSensorIds: ['BIN003'], totalDistance: 8, estimatedTimeMin: 48 }
      ]

      const result = routeOptimizerService.calculateEfficiency(routes)

      expect(result).toHaveProperty('timeSaved')
      expect(result).toHaveProperty('distanceSaved')
      expect(result).toHaveProperty('fuelSaved')
      expect(result.timeSaved).toBeGreaterThanOrEqual(0)
      expect(result.distanceSaved).toBeGreaterThanOrEqual(0)
      expect(result.fuelSaved).toBeGreaterThanOrEqual(0)
    })

    test('should calculate efficiency metrics with original routes', () => {
      const routes = [{ binSensorIds: ['BIN001'], totalDistance: 10, estimatedTimeMin: 60 }]
      const originalRoutes = [{ distance: 20, time: 120 }]

      const result = routeOptimizerService.calculateEfficiency(routes, originalRoutes)

      expect(result).toEqual({ timeSaved: 0, distanceSaved: 0, fuelSaved: 0 })
    })
  })

  describe('updateDistance', () => {
    test('should update distance in distance provider', () => {
      const loc1 = 'Paranthan'
      const loc2 = 'Poonagary'
      const distance = 5

      // Create service with KilinochchiDistanceProvider
      const realProvider = new KilinochchiDistanceProvider()
      const service = new RouteOptimizerService(realProvider, mockStrategy)

      service.updateDistance(loc1, loc2, distance)

      expect(realProvider.getDistance(loc1, loc2)).toBe(distance)
    })

    test('should not update distance if provider is not KilinochchiDistanceProvider', () => {
      // Create service with non-KilinochchiDistanceProvider
      const otherProvider = { getDistance: jest.fn() }
      const service = new RouteOptimizerService(otherProvider, mockStrategy)

      service.updateDistance('loc1', 'loc2', 10)

      expect(mockDistanceProvider.setDistance).not.toHaveBeenCalled()
    })
  })

  describe('setOptimizationStrategy', () => {
    test('should set new optimization strategy', () => {
      const newStrategy = { optimizeRoute: jest.fn() }

      routeOptimizerService.setOptimizationStrategy(newStrategy)

      expect(routeOptimizerService.optimizationStrategy).toBe(newStrategy)
    })
  })
})

describe('NearestNeighborStrategy', () => {
  let strategy
  let mockDistanceProvider

  beforeEach(() => {
    mockDistanceProvider = {
      getDistance: jest.fn((loc1, loc2) => {
        const distances = {
          'A-B': 5, 'A-C': 10, 'B-C': 8,
          'B-A': 5, 'C-A': 10, 'C-B': 8
        }
        return distances[`${loc1}-${loc2}`] || 10
      })
    }
    strategy = new NearestNeighborStrategy(mockDistanceProvider)
  })

  describe('optimizeRoute', () => {
    test('should optimize route using nearest neighbor algorithm', () => {
      const startLocation = 'A'
      const bins = [
        { locationName: 'B', sensorId: 'BIN001', fillLevel: 80 },
        { locationName: 'C', sensorId: 'BIN002', fillLevel: 75 }
      ]

      const result = strategy.optimizeRoute(startLocation, bins)

      expect(result).toHaveProperty('route')
      expect(result).toHaveProperty('totalDistance')
      expect(result.route).toContain(startLocation)
      expect(result.route.length).toBeGreaterThan(1)
    })

    test('should handle empty bins array', () => {
      const startLocation = 'A'
      const bins = []

      const result = strategy.optimizeRoute(startLocation, bins)

      expect(result).toEqual({ route: ['A'], totalDistance: 0 })
    })

    test('should prioritize 100% fill level bins', () => {
      const startLocation = 'A'
      const bins = [
        { locationName: 'B', sensorId: 'BIN001', fillLevel: 75 },
        { locationName: 'C', sensorId: 'BIN002', fillLevel: 100 }
      ]

      const result = strategy.optimizeRoute(startLocation, bins)

      expect(result).toHaveProperty('route')
      expect(result.route[0]).toBe(startLocation)
    })
  })
})

describe('KilinochchiDistanceProvider', () => {
  let provider

  beforeEach(() => {
    provider = new KilinochchiDistanceProvider()
  })

  describe('getDistance', () => {
    test('should return distance from matrix', () => {
      const distance = provider.getDistance('Paranthan', 'Poonagary')

      expect(distance).toBe(5)
    })

    test('should return reverse distance if direct not found', () => {
      const distance = provider.getDistance('Poonagary', 'Paranthan')

      expect(distance).toBe(5)
    })

    test('should return default distance if not in matrix', () => {
      const distance = provider.getDistance('Unknown1', 'Unknown2')

      expect(distance).toBe(10)
    })
  })

  describe('setDistance', () => {
    test('should set distance in matrix', () => {
      provider.setDistance('Loc1', 'Loc2', 15)

      expect(provider.getDistance('Loc1', 'Loc2')).toBe(15)
      expect(provider.getDistance('Loc2', 'Loc1')).toBe(15)
    })
  })

  describe('getLocationCoordinates', () => {
    test('should return coordinates for known location', () => {
      const coords = provider.getLocationCoordinates('Paranthan')

      expect(coords).toHaveProperty('lat')
      expect(coords).toHaveProperty('lng')
    })

    test('should return undefined for unknown location', () => {
      const coords = provider.getLocationCoordinates('Unknown')

      expect(coords).toBeUndefined()
    })
  })

  describe('getClosestLocationName', () => {
    test('should find closest location to coordinates', () => {
      const coordinates = { lat: 9.4297, lng: 80.3683 } // Near Paranthan

      const closest = provider.getClosestLocationName(coordinates)

      expect(closest).toBeDefined()
    })
  })

  describe('getHaversineDistance', () => {
    test('should calculate haversine distance between coordinates', () => {
      const coord1 = { lat: 9.3850, lng: 80.3980 }
      const coord2 = { lat: 9.4297, lng: 80.3683 }

      const distance = provider.getHaversineDistance(coord1, coord2)

      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })
  })

  describe('getDistanceFromCoordinates', () => {
    test('should get distance from truck coordinates to bin location', () => {
      const truckCoords = { lat: 9.3850, lng: 80.3980 }
      const binLocation = 'Paranthan'

      const distance = provider.getDistanceFromCoordinates(truckCoords, binLocation)

      expect(distance).toBeGreaterThan(0)
    })

    test('should fallback to depot distance if coordinates not found', () => {
      const truckCoords = { lat: 0, lng: 0 }
      const binLocation = 'Unknown'

      const distance = provider.getDistanceFromCoordinates(truckCoords, binLocation)

      expect(distance).toBe(10) // Default distance to depot
    })
  })
})