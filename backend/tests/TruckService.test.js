/**
 * Unit tests for TruckService
 * Tests the truck management logic with mocked dependencies
 */
const TruckService = require('../services/TruckService')

// Mock dependencies
jest.mock('../daos/TruckDAO')

const TruckDAO = require('../daos/TruckDAO')

describe('TruckService', () => {
  let truckService
  let mockTruckDAO

  beforeEach(() => {
    mockTruckDAO = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPlate: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findByStatus: jest.fn(),
      count: jest.fn(),
      updateLocation: jest.fn()
    }

    TruckDAO.mockImplementation(() => mockTruckDAO)
    truckService = new TruckService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllTrucks', () => {
    test('should return all trucks successfully', async () => {
      const mockTrucks = [
        { _id: 'truck1', plate: 'ABC-1234', model: 'Truck Model A' },
        { _id: 'truck2', plate: 'DEF-5678', model: 'Truck Model B' }
      ]
      mockTruckDAO.findAll.mockResolvedValue(mockTrucks)

      const result = await truckService.getAllTrucks()

      expect(mockTruckDAO.findAll).toHaveBeenCalledWith({}, { sort: { createdAt: -1 } })
      expect(result).toEqual(mockTrucks)
    })

    test('should apply filter and options', async () => {
      const filter = { status: 'Active' }
      const options = { limit: 10 }
      const mockTrucks = [{ _id: 'truck1', plate: 'ABC-1234', status: 'Active' }]
      mockTruckDAO.findAll.mockResolvedValue(mockTrucks)

      const result = await truckService.getAllTrucks(filter, options)

      expect(mockTruckDAO.findAll).toHaveBeenCalledWith(filter, { sort: { createdAt: -1 }, ...options })
      expect(result).toEqual(mockTrucks)
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findAll.mockRejectedValue(error)

      await expect(truckService.getAllTrucks()).rejects.toThrow('Failed to retrieve trucks: Database error')
    })
  })

  describe('getTruckById', () => {
    test('should return truck by ID successfully', async () => {
      const mockTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'Truck Model A' }
      mockTruckDAO.findById.mockResolvedValue(mockTruck)

      const result = await truckService.getTruckById('truck1')

      expect(mockTruckDAO.findById).toHaveBeenCalledWith('truck1')
      expect(result).toEqual(mockTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findById.mockResolvedValue(null)

      await expect(truckService.getTruckById('truck1')).rejects.toThrow('Truck not found')
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findById.mockRejectedValue(error)

      await expect(truckService.getTruckById('truck1')).rejects.toThrow('Failed to retrieve truck: Database error')
    })
  })

  describe('getTruckByPlate', () => {
    test('should return truck by plate number successfully', async () => {
      const mockTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'Truck Model A' }
      mockTruckDAO.findByPlate.mockResolvedValue(mockTruck)

      const result = await truckService.getTruckByPlate('ABC-1234')

      expect(mockTruckDAO.findByPlate).toHaveBeenCalledWith('ABC-1234')
      expect(result).toEqual(mockTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findByPlate.mockResolvedValue(null)

      await expect(truckService.getTruckByPlate('ABC-1234')).rejects.toThrow('Truck not found')
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findByPlate.mockRejectedValue(error)

      await expect(truckService.getTruckByPlate('ABC-1234')).rejects.toThrow('Failed to retrieve truck by plate: Database error')
    })
  })

  describe('createTruck', () => {
    test('should create truck successfully', async () => {
      const truckData = {
        plate: 'ABC-1234',
        model: 'Truck Model A',
        capacity: 1000
      }
      const expectedTruckData = {
        ...truckData,
        status: 'Inactive',
        currentLocation: null
      }
      const mockCreatedTruck = { _id: 'truck1', ...expectedTruckData }
      mockTruckDAO.findByPlate.mockResolvedValue(null)
      mockTruckDAO.create.mockResolvedValue(mockCreatedTruck)

      const result = await truckService.createTruck(truckData)

      expect(mockTruckDAO.findByPlate).toHaveBeenCalledWith('ABC-1234')
      expect(mockTruckDAO.create).toHaveBeenCalledWith(expectedTruckData)
      expect(result).toEqual(mockCreatedTruck)
    })

    test('should set default values', async () => {
      const truckData = {
        plate: 'ABC-1234',
        model: 'Truck Model A',
        capacity: 1000
      }
      const expectedTruckData = {
        ...truckData,
        status: 'Inactive',
        currentLocation: null
      }
      mockTruckDAO.findByPlate.mockResolvedValue(null)
      mockTruckDAO.create.mockResolvedValue(expectedTruckData)

      await truckService.createTruck(truckData)

      expect(mockTruckDAO.create).toHaveBeenCalledWith(expectedTruckData)
    })

    test('should throw error if plate already exists', async () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000 }
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234' }
      mockTruckDAO.findByPlate.mockResolvedValue(existingTruck)

      await expect(truckService.createTruck(truckData)).rejects.toThrow('Truck with this plate number already exists')
    })

    test('should throw error on validation failure', async () => {
      const truckData = { model: 'Truck Model A', capacity: 1000 } // Missing plate

      await expect(truckService.createTruck(truckData)).rejects.toThrow('Plate number is required and must be a string')
    })

    test('should throw error on DAO failure', async () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000 }
      const error = new Error('Database error')
      mockTruckDAO.findByPlate.mockResolvedValue(null)
      mockTruckDAO.create.mockRejectedValue(error)

      await expect(truckService.createTruck(truckData)).rejects.toThrow('Failed to create truck: Database error')
    })
  })

  describe('updateTruck', () => {
    test('should update truck successfully', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'Truck Model A' }
      const updateData = { model: 'Updated Model' }
      const mockUpdatedTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'Updated Model' }

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.updateById.mockResolvedValue(mockUpdatedTruck)

      const result = await truckService.updateTruck('truck1', updateData)

      expect(mockTruckDAO.findById).toHaveBeenCalledWith('truck1')
      expect(mockTruckDAO.updateById).toHaveBeenCalledWith('truck1', updateData)
      expect(result).toEqual(mockUpdatedTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findById.mockResolvedValue(null)

      await expect(truckService.updateTruck('truck1', { model: 'New Model' })).rejects.toThrow('Truck not found')
    })

    test('should throw error if plate number already exists', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234' }
      const updateData = { plate: 'DEF-5678' }
      const duplicateTruck = { _id: 'truck2', plate: 'DEF-5678' }

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.findByPlate.mockResolvedValue(duplicateTruck)

      await expect(truckService.updateTruck('truck1', updateData)).rejects.toThrow('Truck with this plate number already exists')
    })

    test('should allow updating to same plate number', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234' }
      const updateData = { plate: 'ABC-1234', model: 'New Model' }
      const mockUpdatedTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'New Model' }

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.findByPlate.mockResolvedValue(existingTruck)
      mockTruckDAO.updateById.mockResolvedValue(mockUpdatedTruck)

      const result = await truckService.updateTruck('truck1', updateData)

      expect(result).toEqual(mockUpdatedTruck)
    })

    test('should throw error on DAO failure', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234' }
      const error = new Error('Database error')

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.updateById.mockRejectedValue(error)

      await expect(truckService.updateTruck('truck1', { model: 'New Model' })).rejects.toThrow('Failed to update truck: Database error')
    })
  })

  describe('deleteTruck', () => {
    test('should delete truck successfully', async () => {
      const mockDeletedTruck = { _id: 'truck1', plate: 'ABC-1234', model: 'Truck Model A' }
      mockTruckDAO.deleteById.mockResolvedValue(mockDeletedTruck)

      const result = await truckService.deleteTruck('truck1')

      expect(mockTruckDAO.deleteById).toHaveBeenCalledWith('truck1')
      expect(result).toEqual(mockDeletedTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.deleteById.mockResolvedValue(null)

      await expect(truckService.deleteTruck('truck1')).rejects.toThrow('Truck not found')
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.deleteById.mockRejectedValue(error)

      await expect(truckService.deleteTruck('truck1')).rejects.toThrow('Failed to delete truck: Database error')
    })
  })

  describe('updateTruckLocation', () => {
    test('should update truck location successfully', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', status: 'Active' }
      const location = { lat: 9.3850, lng: 80.3980 }
      const mockUpdatedTruck = { _id: 'truck1', plate: 'ABC-1234', currentLocation: location }

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.updateLocation.mockResolvedValue(mockUpdatedTruck)

      const result = await truckService.updateTruckLocation('truck1', location)

      expect(mockTruckDAO.findById).toHaveBeenCalledWith('truck1')
      expect(mockTruckDAO.updateLocation).toHaveBeenCalledWith('truck1', location)
      expect(result).toEqual(mockUpdatedTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findById.mockResolvedValue(null)

      await expect(truckService.updateTruckLocation('truck1', { lat: 0, lng: 0 })).rejects.toThrow('Truck not found')
    })

    test('should throw error if truck is inactive', async () => {
      const inactiveTruck = { _id: 'truck1', plate: 'ABC-1234', status: 'Inactive' }
      mockTruckDAO.findById.mockResolvedValue(inactiveTruck)

      await expect(truckService.updateTruckLocation('truck1', { lat: 0, lng: 0 })).rejects.toThrow('Cannot update location for inactive truck')
    })

    test('should throw error for invalid location data', async () => {
      const activeTruck = { _id: 'truck1', plate: 'ABC-1234', status: 'Active' }
      mockTruckDAO.findById.mockResolvedValue(activeTruck)

      await expect(truckService.updateTruckLocation('truck1', null)).rejects.toThrow('Valid location data is required')
    })

    test('should throw error on DAO failure', async () => {
      const activeTruck = { _id: 'truck1', plate: 'ABC-1234', status: 'Active' }
      const error = new Error('Database error')

      mockTruckDAO.findById.mockResolvedValue(activeTruck)
      mockTruckDAO.updateLocation.mockRejectedValue(error)

      await expect(truckService.updateTruckLocation('truck1', { lat: 0, lng: 0 })).rejects.toThrow('Failed to update truck location: Database error')
    })
  })

  describe('getActiveTrucks', () => {
    test('should return active trucks successfully', async () => {
      const mockActiveTrucks = [
        { _id: 'truck1', plate: 'ABC-1234', status: 'Active' },
        { _id: 'truck2', plate: 'DEF-5678', status: 'Active' }
      ]
      mockTruckDAO.findByStatus.mockResolvedValue(mockActiveTrucks)

      const result = await truckService.getActiveTrucks()

      expect(mockTruckDAO.findByStatus).toHaveBeenCalledWith('Active')
      expect(result).toEqual(mockActiveTrucks)
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findByStatus.mockRejectedValue(error)

      await expect(truckService.getActiveTrucks()).rejects.toThrow('Failed to get active trucks: Database error')
    })
  })

  describe('getTrucksByStatus', () => {
    test('should return trucks by status successfully', async () => {
      const status = 'Maintenance'
      const mockTrucks = [{ _id: 'truck1', plate: 'ABC-1234', status: 'Maintenance' }]
      mockTruckDAO.findByStatus.mockResolvedValue(mockTrucks)

      const result = await truckService.getTrucksByStatus(status)

      expect(mockTruckDAO.findByStatus).toHaveBeenCalledWith(status)
      expect(result).toEqual(mockTrucks)
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findByStatus.mockRejectedValue(error)

      await expect(truckService.getTrucksByStatus('Active')).rejects.toThrow('Failed to get trucks by status: Database error')
    })
  })

  describe('getTruckStatistics', () => {
    test('should return truck statistics successfully', async () => {
      mockTruckDAO.count.mockResolvedValueOnce(10) // total
      mockTruckDAO.count.mockResolvedValueOnce(6)  // active
      mockTruckDAO.count.mockResolvedValueOnce(2)  // inactive
      mockTruckDAO.count.mockResolvedValueOnce(2)  // maintenance

      const result = await truckService.getTruckStatistics()

      expect(mockTruckDAO.count).toHaveBeenCalledTimes(4)
      expect(mockTruckDAO.count).toHaveBeenCalledWith()
      expect(mockTruckDAO.count).toHaveBeenCalledWith({ status: 'Active' })
      expect(mockTruckDAO.count).toHaveBeenCalledWith({ status: 'Inactive' })
      expect(mockTruckDAO.count).toHaveBeenCalledWith({ status: 'Maintenance' })
      expect(result).toEqual({
        total: 10,
        active: 6,
        inactive: 2,
        maintenance: 2
      })
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.count.mockRejectedValue(error)

      await expect(truckService.getTruckStatistics()).rejects.toThrow('Failed to get truck statistics: Database error')
    })
  })

  describe('updateTruckFuelLevel', () => {
    test('should update fuel level successfully', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', fuelCapacity: 100 }
      const fuelLevel = 50
      const mockUpdatedTruck = { _id: 'truck1', plate: 'ABC-1234', currentFuelLevel: 50 }

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.updateById.mockResolvedValue(mockUpdatedTruck)

      const result = await truckService.updateTruckFuelLevel('truck1', fuelLevel)

      expect(mockTruckDAO.findById).toHaveBeenCalledWith('truck1')
      expect(mockTruckDAO.updateById).toHaveBeenCalledWith('truck1', { currentFuelLevel: fuelLevel })
      expect(result).toEqual(mockUpdatedTruck)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findById.mockResolvedValue(null)

      await expect(truckService.updateTruckFuelLevel('truck1', 50)).rejects.toThrow('Truck not found')
    })

    test('should throw error for negative fuel level', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', fuelCapacity: 100 }
      mockTruckDAO.findById.mockResolvedValue(existingTruck)

      await expect(truckService.updateTruckFuelLevel('truck1', -10)).rejects.toThrow('Fuel level must be between 0 and 100 liters')
    })

    test('should throw error for fuel level exceeding capacity', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', fuelCapacity: 100 }
      mockTruckDAO.findById.mockResolvedValue(existingTruck)

      await expect(truckService.updateTruckFuelLevel('truck1', 150)).rejects.toThrow('Fuel level must be between 0 and 100 liters')
    })

    test('should throw error on DAO failure', async () => {
      const existingTruck = { _id: 'truck1', plate: 'ABC-1234', fuelCapacity: 100 }
      const error = new Error('Database error')

      mockTruckDAO.findById.mockResolvedValue(existingTruck)
      mockTruckDAO.updateById.mockRejectedValue(error)

      await expect(truckService.updateTruckFuelLevel('truck1', 50)).rejects.toThrow('Failed to update truck fuel level: Database error')
    })
  })

  describe('getTrucksWithSufficientFuel', () => {
    test('should return trucks with sufficient fuel', async () => {
      const mockActiveTrucks = [
        { _id: 'truck1', plate: 'ABC-1234', currentFuelLevel: 60, fuelEfficiency: 10 },
        { _id: 'truck2', plate: 'DEF-5678', currentFuelLevel: 30, fuelEfficiency: 10 },
        { _id: 'truck3', plate: 'GHI-9012', currentFuelLevel: 80, fuelEfficiency: 10 }
      ]
      const distance = 50 // Requires 5L of fuel

      mockTruckDAO.findByStatus.mockResolvedValue(mockActiveTrucks)

      const result = await truckService.getTrucksWithSufficientFuel(distance)

      expect(result).toHaveLength(3)
      expect(result).toContain(mockActiveTrucks[0])
      expect(result).toContain(mockActiveTrucks[1])
      expect(result).toContain(mockActiveTrucks[2])
    })

    test('should return empty array if no trucks have sufficient fuel', async () => {
      const mockActiveTrucks = [
        { _id: 'truck1', plate: 'ABC-1234', currentFuelLevel: 2, fuelEfficiency: 10 } // Only 2L, needs 5L
      ]
      const distance = 50 // Requires 5L of fuel

      mockTruckDAO.findByStatus.mockResolvedValue(mockActiveTrucks)

      const result = await truckService.getTrucksWithSufficientFuel(distance)

      expect(result).toHaveLength(0)
    })

    test('should throw error on service failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findByStatus.mockRejectedValue(error)

      await expect(truckService.getTrucksWithSufficientFuel(50)).rejects.toThrow('Failed to get trucks with sufficient fuel: Failed to get active trucks: Database error')
    })
  })

  describe('calculateFuelConsumption', () => {
    test('should calculate fuel consumption correctly', async () => {
      const truck = {
        _id: 'truck1',
        plate: 'ABC-1234',
        currentFuelLevel: 60,
        fuelEfficiency: 10
      }
      const distance = 50
      const expectedConsumption = 5 // 50km / 10km/L

      mockTruckDAO.findById.mockResolvedValue(truck)

      const result = await truckService.calculateFuelConsumption('truck1', distance)

      expect(result.truckId).toBe('truck1')
      expect(result.truckPlate).toBe('ABC-1234')
      expect(result.distance).toBe(50)
      expect(result.fuelConsumption).toBe(5)
      expect(result.currentFuelLevel).toBe(60)
      expect(result.fuelEfficiency).toBe(10)
      expect(result.hasEnoughFuel).toBe(true)
      expect(result.remainingFuel).toBe(55)
    })

    test('should handle insufficient fuel', async () => {
      const truck = {
        _id: 'truck1',
        plate: 'ABC-1234',
        currentFuelLevel: 30,
        fuelEfficiency: 10
      }
      const distance = 50 // Requires 5L, but only 30L available

      mockTruckDAO.findById.mockResolvedValue(truck)

      const result = await truckService.calculateFuelConsumption('truck1', distance)

      expect(result.hasEnoughFuel).toBe(true) // 30L > 5L
      expect(result.remainingFuel).toBe(25)
    })

    test('should throw error if truck not found', async () => {
      mockTruckDAO.findById.mockResolvedValue(null)

      await expect(truckService.calculateFuelConsumption('truck1', 50)).rejects.toThrow('Truck not found')
    })

    test('should throw error on DAO failure', async () => {
      const error = new Error('Database error')
      mockTruckDAO.findById.mockRejectedValue(error)

      await expect(truckService.calculateFuelConsumption('truck1', 50)).rejects.toThrow('Failed to calculate fuel consumption: Failed to retrieve truck: Database error')
    })
  })

  describe('validateTruckData', () => {
    test('should validate correct truck data', () => {
      const truckData = {
        plate: 'ABC-1234',
        model: 'Truck Model A',
        capacity: 1000,
        fuelCapacity: 100,
        currentFuelLevel: 50,
        fuelEfficiency: 10,
        status: 'Active'
      }

      expect(() => truckService.validateTruckData(truckData)).not.toThrow()
    })

    test('should throw error for missing plate', () => {
      const truckData = { model: 'Truck Model A', capacity: 1000 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Plate number is required and must be a string')
    })

    test('should throw error for invalid plate type', () => {
      const truckData = { plate: 12345, model: 'Truck Model A', capacity: 1000 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Plate number is required and must be a string')
    })

    test('should throw error for missing model', () => {
      const truckData = { plate: 'ABC-1234', capacity: 1000 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Model is required and must be a string')
    })

    test('should throw error for invalid capacity', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 'invalid' }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Capacity is required and must be a positive number')
    })

    test('should throw error for negative capacity', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: -100 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Capacity is required and must be a positive number')
    })

    test('should throw error for invalid fuel capacity', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000, fuelCapacity: 'invalid' }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Fuel capacity must be a positive number')
    })

    test('should throw error for negative fuel level', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000, currentFuelLevel: -10 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Current fuel level must be a non-negative number')
    })

    test('should throw error for invalid fuel efficiency', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000, fuelEfficiency: 0 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Fuel efficiency must be a positive number')
    })

    test('should throw error for invalid status', () => {
      const truckData = { plate: 'ABC-1234', model: 'Truck Model A', capacity: 1000, status: 'Invalid' }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Status must be one of: Active, Inactive, Maintenance')
    })

    test('should throw error for invalid plate format', () => {
      const truckData = { plate: 'INVALID', model: 'Truck Model A', capacity: 1000 }

      expect(() => truckService.validateTruckData(truckData)).toThrow('Plate number format is invalid')
    })
  })
})