/**
 * Unit tests for CollectionService using Jest
 */

const CollectionService = require('../services/CollectionService')
const CollectionDAO = require('../daos/CollectionDAO')
const BinService = require('../services/BinService')
const TruckService = require('../services/TruckService')

// Mock the dependencies
jest.mock('../daos/CollectionDAO')
jest.mock('../services/BinService')
jest.mock('../services/TruckService')

describe('CollectionService', () => {
  let collectionService
  let mockCollectionDAO
  let mockBinService
  let mockTruckService

  beforeEach(() => {
    // Reset mocks before each test
    mockCollectionDAO = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findByTruck: jest.fn(),
      findByBin: jest.fn(),
      findByDateRange: jest.fn(),
      getStatistics: jest.fn(),
    }

    mockBinService = {
      getBinById: jest.fn(),
    }

    mockTruckService = {
      getTruckById: jest.fn(),
    }

    CollectionDAO.mockImplementation(() => mockCollectionDAO)
    BinService.mockImplementation(() => mockBinService)
    TruckService.mockImplementation(() => mockTruckService)

    collectionService = new CollectionService(mockCollectionDAO, mockBinService, mockTruckService)
  })

  // ---------------- GET ALL COLLECTIONS ----------------
  describe('getAllCollections()', () => {
    it('should return all collections with population', async () => {
      const mockCollections = [{ id: '1' }, { id: '2' }]
      mockCollectionDAO.findAll.mockResolvedValue(mockCollections)

      const result = await collectionService.getAllCollections()

      expect(mockCollectionDAO.findAll).toHaveBeenCalledWith({}, {
        sort: { date: -1 },
        populate: expect.any(Array)
      })
      expect(result).toBe(mockCollections)
    })

    it('should apply filter and options', async () => {
      const filter = { truck: 'truck1' }
      const options = { limit: 10 }

      mockCollectionDAO.findAll.mockResolvedValue([])

      await collectionService.getAllCollections(filter, options)

      expect(mockCollectionDAO.findAll).toHaveBeenCalledWith(filter, {
        sort: { date: -1 },
        populate: expect.any(Array),
        ...options
      })
    })
  })

  // ---------------- GET COLLECTION BY ID ----------------
  describe('getCollectionById()', () => {
    it('should return collection with population', async () => {
      const mockCollection = { id: '1', truck: 'truck1' }
      mockCollectionDAO.findById.mockResolvedValue(mockCollection)

      const result = await collectionService.getCollectionById('1')

      expect(mockCollectionDAO.findById).toHaveBeenCalledWith('1', { populate: expect.any(Array) })
      expect(result).toBe(mockCollection)
    })

    it('should throw error if collection not found', async () => {
      mockCollectionDAO.findById.mockResolvedValue(null)

      await expect(collectionService.getCollectionById('999')).rejects.toThrow('Failed to retrieve collection: Collection not found')
    })
  })

  // ---------------- CREATE COLLECTION ----------------
  describe('createCollection()', () => {
    it('should create collection successfully', async () => {
      const collectionData = { truck: 'truck1', bins: ['bin1', 'bin2'] }
      const userId = 'user1'
      const mockTruck = { status: 'Active' }
      const createdCollection = { ...collectionData, createdBy: userId }

      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockBinService.getBinById.mockResolvedValue({}) // Mock for each bin
      mockCollectionDAO.create.mockResolvedValue(createdCollection)

      const result = await collectionService.createCollection(collectionData, userId)

      expect(mockTruckService.getTruckById).toHaveBeenCalledWith('truck1')
      expect(mockBinService.getBinById).toHaveBeenCalledTimes(2)
      expect(mockCollectionDAO.create).toHaveBeenCalledWith(
        expect.objectContaining({
          truck: 'truck1',
          bins: ['bin1', 'bin2'],
          createdBy: 'user1',
          date: expect.any(Date)
        })
      )
      expect(result).toBe(createdCollection)
    })

    it('should create collection without bins', async () => {
      const collectionData = { truck: 'truck1' }
      const userId = 'user1'
      const mockTruck = { status: 'Active' }
      const createdCollection = { ...collectionData, createdBy: userId }

      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockCollectionDAO.create.mockResolvedValue(createdCollection)

      const result = await collectionService.createCollection(collectionData, userId)

      expect(mockBinService.getBinById).not.toHaveBeenCalled()
      expect(result).toBe(createdCollection)
    })

    it('should throw error for inactive truck', async () => {
      const collectionData = { truck: 'truck1' }
      const mockTruck = { status: 'Inactive' }

      mockTruckService.getTruckById.mockResolvedValue(mockTruck)

      await expect(collectionService.createCollection(collectionData, 'user1')).rejects.toThrow('Failed to create collection: Cannot create collection for inactive truck')
    })

    it('should throw error for invalid bin', async () => {
      const collectionData = { truck: 'truck1', bins: ['invalid'] }
      const mockTruck = { status: 'Active' }

      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockBinService.getBinById.mockRejectedValue(new Error('Bin not found'))

      await expect(collectionService.createCollection(collectionData, 'user1')).rejects.toThrow('Failed to create collection: Bin not found')
    })

    it('should validate collection data', async () => {
      await expect(collectionService.createCollection({}, 'user1')).rejects.toThrow('Failed to create collection: Truck ID is required and must be a string')
      await expect(collectionService.createCollection({ truck: 123 }, 'user1')).rejects.toThrow('Failed to create collection: Truck ID is required and must be a string')
      await expect(collectionService.createCollection({ truck: 'truck1', bins: 'not-array' }, 'user1')).rejects.toThrow('Failed to create collection: Bins must be an array if provided')
      await expect(collectionService.createCollection({ truck: 'truck1', generalWaste: -1 }, 'user1')).rejects.toThrow('Failed to create collection: generalWaste must be a non-negative number')
      await expect(collectionService.createCollection({ truck: 'truck1', date: 'invalid-date' }, 'user1')).rejects.toThrow('Failed to create collection: Invalid date format')
    })
  })

  // ---------------- UPDATE COLLECTION ----------------
  describe('updateCollection()', () => {
    it('should update collection successfully', async () => {
      const existingCollection = { id: '1', truck: 'truck1' }
      const updateData = { generalWaste: 100 }
      const mockTruck = { status: 'Active' }
      const updatedCollection = { ...existingCollection, ...updateData }

      mockCollectionDAO.findById.mockResolvedValue(existingCollection)
      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockCollectionDAO.updateById.mockResolvedValue(updatedCollection)

      const result = await collectionService.updateCollection('1', updateData)

      expect(mockCollectionDAO.updateById).toHaveBeenCalledWith('1', updateData)
      expect(result).toBe(updatedCollection)
    })

    it('should validate truck status when updating truck', async () => {
      const existingCollection = { id: '1', truck: 'truck1' }
      const updateData = { truck: 'truck2' }
      const mockTruck = { status: 'Active' }

      mockCollectionDAO.findById.mockResolvedValue(existingCollection)
      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockCollectionDAO.updateById.mockResolvedValue({ ...existingCollection, ...updateData })

      await collectionService.updateCollection('1', updateData)

      expect(mockTruckService.getTruckById).toHaveBeenCalledWith('truck2')
    })

    it('should throw error for inactive truck update', async () => {
      const existingCollection = { id: '1', truck: 'truck1' }
      const updateData = { truck: 'truck2' }
      const mockTruck = { status: 'Inactive' }

      mockCollectionDAO.findById.mockResolvedValue(existingCollection)
      mockTruckService.getTruckById.mockResolvedValue(mockTruck)

      await expect(collectionService.updateCollection('1', updateData)).rejects.toThrow('Failed to update collection: Cannot update collection with inactive truck')
    })

    it('should throw error if collection not found', async () => {
      mockCollectionDAO.findById.mockResolvedValue(null)

      await expect(collectionService.updateCollection('999', {})).rejects.toThrow('Failed to update collection: Collection not found')
    })
  })

  // ---------------- DELETE COLLECTION ----------------
  describe('deleteCollection()', () => {
    it('should delete collection successfully', async () => {
      const deletedCollection = { id: '1' }
      mockCollectionDAO.deleteById.mockResolvedValue(deletedCollection)

      const result = await collectionService.deleteCollection('1')

      expect(mockCollectionDAO.deleteById).toHaveBeenCalledWith('1')
      expect(result).toBe(deletedCollection)
    })

    it('should throw error if collection not found', async () => {
      mockCollectionDAO.deleteById.mockResolvedValue(null)

      await expect(collectionService.deleteCollection('999')).rejects.toThrow('Failed to delete collection: Collection not found')
    })
  })

  // ---------------- GET COLLECTIONS BY TRUCK ----------------
  describe('getCollectionsByTruck()', () => {
    it('should return collections by truck', async () => {
      const mockTruck = { id: 'truck1' }
      const collections = [{ truck: 'truck1' }]

      mockTruckService.getTruckById.mockResolvedValue(mockTruck)
      mockCollectionDAO.findByTruck.mockResolvedValue(collections)

      const result = await collectionService.getCollectionsByTruck('truck1')

      expect(mockTruckService.getTruckById).toHaveBeenCalledWith('truck1')
      expect(mockCollectionDAO.findByTruck).toHaveBeenCalledWith('truck1', { populate: expect.any(Array) })
      expect(result).toBe(collections)
    })

    it('should throw error if truck not found', async () => {
      mockTruckService.getTruckById.mockRejectedValue(new Error('Truck not found'))

      await expect(collectionService.getCollectionsByTruck('invalid')).rejects.toThrow('Failed to get collections by truck: Truck not found')
    })
  })

  // ---------------- GET COLLECTIONS BY BIN ----------------
  describe('getCollectionsByBin()', () => {
    it('should return collections by bin', async () => {
      const mockBin = { id: 'bin1' }
      const collections = [{ bins: ['bin1'] }]

      mockBinService.getBinById.mockResolvedValue(mockBin)
      mockCollectionDAO.findByBin.mockResolvedValue(collections)

      const result = await collectionService.getCollectionsByBin('bin1')

      expect(mockBinService.getBinById).toHaveBeenCalledWith('bin1')
      expect(mockCollectionDAO.findByBin).toHaveBeenCalledWith('bin1', { populate: expect.any(Array) })
      expect(result).toBe(collections)
    })

    it('should throw error if bin not found', async () => {
      mockBinService.getBinById.mockRejectedValue(new Error('Bin not found'))

      await expect(collectionService.getCollectionsByBin('invalid')).rejects.toThrow('Failed to get collections by bin: Bin not found')
    })
  })

  // ---------------- GET COLLECTIONS BY DATE RANGE ----------------
  describe('getCollectionsByDateRange()', () => {
    it('should return collections by date range', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-12-31')
      const collections = [{ date: new Date('2023-06-01') }]

      mockCollectionDAO.findByDateRange.mockResolvedValue(collections)

      const result = await collectionService.getCollectionsByDateRange(startDate, endDate)

      expect(mockCollectionDAO.findByDateRange).toHaveBeenCalledWith(startDate, endDate, { populate: expect.any(Array) })
      expect(result).toBe(collections)
    })
  })

  // ---------------- GET COLLECTION STATISTICS ----------------
  describe('getCollectionStatistics()', () => {
    it('should return collection statistics', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-12-31')
      const stats = { totalCollections: 10, totalWaste: 1000 }

      mockCollectionDAO.getStatistics.mockResolvedValue(stats)

      const result = await collectionService.getCollectionStatistics(startDate, endDate)

      expect(mockCollectionDAO.getStatistics).toHaveBeenCalledWith(startDate, endDate)
      expect(result).toBe(stats)
    })
  })

  // ---------------- GET DASHBOARD SUMMARY ----------------
  describe('getDashboardSummary()', () => {
    it('should return dashboard summary', async () => {
      const stats = { totalCollections: 5 }
      const recentCollections = [{ id: '1' }, { id: '2' }]

      mockCollectionDAO.getStatistics.mockResolvedValue(stats)
      mockCollectionDAO.findByDateRange.mockResolvedValue(recentCollections)

      const result = await collectionService.getDashboardSummary(30)

      expect(result).toHaveProperty('statistics', stats)
      expect(result).toHaveProperty('recentCollections', recentCollections)
      expect(result).toHaveProperty('period')
      expect(result.period.days).toBe(30)
    })

    it('should use default days parameter', async () => {
      mockCollectionDAO.getStatistics.mockResolvedValue({})
      mockCollectionDAO.findByDateRange.mockResolvedValue([])

      const result = await collectionService.getDashboardSummary()

      expect(result.period.days).toBe(30)
    })
  })
})
