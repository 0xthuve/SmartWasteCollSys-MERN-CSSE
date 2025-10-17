/**
 * Unit tests for BinService using Jest
 */

const BinService = require('../services/BinService')
const BinDAO = require('../daos/BinDAO')

// Mock the BinDAO class
jest.mock('../daos/BinDAO')

describe('BinService', () => {
  let binService
  let mockBinDAO

  beforeEach(() => {
    // Reset mocks before each test
    mockBinDAO = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySensorId: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      updateBySensorId: jest.fn(),
      deleteAll: jest.fn(),
      insertMany: jest.fn(),
    }

    BinDAO.mockImplementation(() => mockBinDAO)

    binService = new BinService(mockBinDAO)
  })

  // ---------------- GET ALL BINS WITH STATUS ----------------
  describe('getAllBinsWithStatus()', () => {
    it('should return bins with calculated status', async () => {
      const mockBins = [
        { toObject: () => ({ id: '1', fillLevel: 20 }), fillLevel: 20 },
        { toObject: () => ({ id: '2', fillLevel: 80 }), fillLevel: 80 },
        { toObject: () => ({ id: '3', fillLevel: 100 }), fillLevel: 100 },
      ]

      mockBinDAO.findAll.mockResolvedValue(mockBins)

      const result = await binService.getAllBinsWithStatus()

      expect(mockBinDAO.findAll).toHaveBeenCalledWith({}, { sort: { createdAt: -1 } })
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('status', 'Empty')
      expect(result[1]).toHaveProperty('status', 'Full')
      expect(result[2]).toHaveProperty('status', 'Priority')
    })

    it('should apply filter and options', async () => {
      const filter = { locationName: 'Test' }
      const options = { limit: 10 }

      mockBinDAO.findAll.mockResolvedValue([])

      await binService.getAllBinsWithStatus(filter, options)

      expect(mockBinDAO.findAll).toHaveBeenCalledWith(filter, { sort: { createdAt: -1 }, ...options })
    })

    it('should throw error on DAO failure', async () => {
      mockBinDAO.findAll.mockRejectedValue(new Error('DB error'))

      await expect(binService.getAllBinsWithStatus()).rejects.toThrow('Failed to retrieve bins with status: DB error')
    })
  })

  // ---------------- GET BIN BY ID WITH STATUS ----------------
  describe('getBinByIdWithStatus()', () => {
    it('should return bin with calculated status', async () => {
      const mockBin = { toObject: () => ({ id: '1', fillLevel: 50 }), fillLevel: 50 }
      mockBinDAO.findById.mockResolvedValue(mockBin)

      const result = await binService.getBinByIdWithStatus('1')

      expect(mockBinDAO.findById).toHaveBeenCalledWith('1')
      expect(result).toHaveProperty('status', 'Half')
    })

    it('should throw error if bin not found', async () => {
      mockBinDAO.findById.mockResolvedValue(null)

      await expect(binService.getBinByIdWithStatus('999')).rejects.toThrow('Failed to retrieve bin: Bin not found')
    })
  })

  // ---------------- GET BIN BY SENSOR ID ----------------
  describe('getBinBySensorId()', () => {
    it('should return bin by sensor ID', async () => {
      const mockBin = { sensorId: 'SENSOR001' }
      mockBinDAO.findBySensorId.mockResolvedValue(mockBin)

      const result = await binService.getBinBySensorId('SENSOR001')

      expect(mockBinDAO.findBySensorId).toHaveBeenCalledWith('SENSOR001')
      expect(result).toBe(mockBin)
    })

    it('should throw error if bin not found', async () => {
      mockBinDAO.findBySensorId.mockResolvedValue(null)

      await expect(binService.getBinBySensorId('INVALID')).rejects.toThrow('Failed to retrieve bin by sensor ID: Bin not found')
    })
  })

  // ---------------- CREATE BIN ----------------
  describe('createBin()', () => {
    it('should create bin successfully', async () => {
      const binData = { sensorId: 'SENSOR001', locationName: 'Test Location' }
      const createdBin = { ...binData, fillLevel: 0, lastSeenAt: expect.any(Date) }

      mockBinDAO.findBySensorId.mockResolvedValue(null)
      mockBinDAO.create.mockResolvedValue(createdBin)

      const result = await binService.createBin(binData)

      expect(mockBinDAO.findBySensorId).toHaveBeenCalledWith('SENSOR001')
      expect(mockBinDAO.create).toHaveBeenCalledWith(createdBin)
      expect(result).toBe(createdBin)
    })

    it('should throw error for duplicate sensor ID', async () => {
      const binData = { sensorId: 'SENSOR001', locationName: 'Test' }
      mockBinDAO.findBySensorId.mockResolvedValue({ sensorId: 'SENSOR001' })

      await expect(binService.createBin(binData)).rejects.toThrow('Failed to create bin: Bin with this sensor ID already exists')
    })

    it('should validate bin data', async () => {
      await expect(binService.createBin({})).rejects.toThrow('Failed to create bin: Sensor ID is required and must be a string')
      await expect(binService.createBin({ sensorId: 123 })).rejects.toThrow('Failed to create bin: Sensor ID is required and must be a string')
      await expect(binService.createBin({ sensorId: 'SENSOR001' })).rejects.toThrow('Failed to create bin: Location name is required and must be a string')
      await expect(binService.createBin({ sensorId: 'SENSOR001', locationName: 'Test', fillLevel: -1 })).rejects.toThrow('Failed to create bin: Fill level must be a number between 0 and 100')
    })
  })

  // ---------------- UPDATE BIN ----------------
  describe('updateBin()', () => {
    it('should update bin successfully', async () => {
      const existingBin = { sensorId: 'SENSOR001' }
      const updateData = { locationName: 'New Location' }
      const updatedBin = { ...existingBin, ...updateData }

      mockBinDAO.findById.mockResolvedValue(existingBin)
      mockBinDAO.updateById.mockResolvedValue(updatedBin)

      const result = await binService.updateBin('1', updateData)

      expect(mockBinDAO.findById).toHaveBeenCalledWith('1')
      expect(mockBinDAO.updateById).toHaveBeenCalledWith('1', updateData)
      expect(result).toBe(updatedBin)
    })

    it('should check sensor ID uniqueness when updating', async () => {
      const existingBin = { sensorId: 'SENSOR001' }
      const updateData = { sensorId: 'SENSOR002' }

      mockBinDAO.findById.mockResolvedValue(existingBin)
      mockBinDAO.findBySensorId.mockResolvedValue(null)
      mockBinDAO.updateById.mockResolvedValue({ ...existingBin, ...updateData })

      await binService.updateBin('1', updateData)

      expect(mockBinDAO.findBySensorId).toHaveBeenCalledWith('SENSOR002')
    })

    it('should throw error for duplicate sensor ID', async () => {
      const existingBin = { sensorId: 'SENSOR001' }
      const updateData = { sensorId: 'SENSOR002' }

      mockBinDAO.findById.mockResolvedValue(existingBin)
      mockBinDAO.findBySensorId.mockResolvedValue({ sensorId: 'SENSOR002' })

      await expect(binService.updateBin('1', updateData)).rejects.toThrow('Failed to update bin: Bin with this sensor ID already exists')
    })

    it('should throw error if bin not found', async () => {
      mockBinDAO.findById.mockResolvedValue(null)

      await expect(binService.updateBin('999', {})).rejects.toThrow('Failed to update bin: Bin not found')
    })

    it('should remove status from updateData', async () => {
      const existingBin = { sensorId: 'SENSOR001' }
      const updateData = { locationName: 'New', status: 'Full' }

      mockBinDAO.findById.mockResolvedValue(existingBin)
      mockBinDAO.updateById.mockResolvedValue({ ...existingBin, locationName: 'New' })

      await binService.updateBin('1', updateData)

      expect(mockBinDAO.updateById).toHaveBeenCalledWith('1', { locationName: 'New' })
    })
  })

  // ---------------- DELETE BIN ----------------
  describe('deleteBin()', () => {
    it('should delete bin successfully', async () => {
      const deletedBin = { id: '1', sensorId: 'SENSOR001' }
      mockBinDAO.deleteById.mockResolvedValue(deletedBin)

      const result = await binService.deleteBin('1')

      expect(mockBinDAO.deleteById).toHaveBeenCalledWith('1')
      expect(result).toBe(deletedBin)
    })

    it('should throw error if bin not found', async () => {
      mockBinDAO.deleteById.mockResolvedValue(null)

      await expect(binService.deleteBin('999')).rejects.toThrow('Failed to delete bin: Bin not found')
    })
  })

  // ---------------- REPORT FILL LEVEL ----------------
  describe('reportFillLevel()', () => {
    it('should update fill level successfully', async () => {
      const updatedBin = { sensorId: 'SENSOR001', fillLevel: 75 }
      mockBinDAO.updateBySensorId.mockResolvedValue(updatedBin)

      const result = await binService.reportFillLevel('SENSOR001', 75)

      expect(mockBinDAO.updateBySensorId).toHaveBeenCalledWith('SENSOR001', {
        fillLevel: 75,
        lastSeenAt: expect.any(Date)
      })
      expect(result).toBe(updatedBin)
    })

    it('should validate fill level range', async () => {
      await expect(binService.reportFillLevel('SENSOR001', -1)).rejects.toThrow('Failed to report fill level: Fill level must be between 0 and 100')
      await expect(binService.reportFillLevel('SENSOR001', 101)).rejects.toThrow('Failed to report fill level: Fill level must be between 0 and 100')
    })

    it('should throw error if bin not found', async () => {
      mockBinDAO.updateBySensorId.mockResolvedValue(null)

      await expect(binService.reportFillLevel('INVALID', 50)).rejects.toThrow('Failed to report fill level: Bin not found')
    })
  })

  // ---------------- GET BINS NEEDING COLLECTION ----------------
  describe('getBinsNeedingCollection()', () => {
    it('should return bins with fill level > 70%', async () => {
      const bins = [{ fillLevel: 80 }, { fillLevel: 90 }]
      mockBinDAO.findAll.mockResolvedValue(bins)

      const result = await binService.getBinsNeedingCollection()

      expect(mockBinDAO.findAll).toHaveBeenCalledWith({ fillLevel: { $gt: 70 } })
      expect(result).toBe(bins)
    })
  })

  // ---------------- GET PRIORITY BINS ----------------
  describe('getPriorityBins()', () => {
    it('should return bins with fill level >= 100%', async () => {
      const bins = [{ fillLevel: 100 }, { fillLevel: 110 }]
      mockBinDAO.findAll.mockResolvedValue(bins)

      const result = await binService.getPriorityBins()

      expect(mockBinDAO.findAll).toHaveBeenCalledWith({ fillLevel: { $gte: 100 } })
      expect(result).toBe(bins)
    })
  })

  // ---------------- SEED BINS ----------------
  describe('seedBins()', () => {
    it('should seed bins successfully', async () => {
      const binsData = [
        { sensorId: 'SENSOR001', locationName: 'Location 1' },
        { sensorId: 'SENSOR002', locationName: 'Location 2' }
      ]
      const createdBins = binsData

      mockBinDAO.insertMany.mockResolvedValue(createdBins)

      const result = await binService.seedBins(binsData)

      expect(mockBinDAO.deleteAll).toHaveBeenCalled()
      expect(mockBinDAO.insertMany).toHaveBeenCalledWith(binsData)
      expect(result).toBe(createdBins)
    })

    it('should validate all bin data before seeding', async () => {
      const invalidBinsData = [{ sensorId: 'SENSOR001' }] // Missing locationName

      await expect(binService.seedBins(invalidBinsData)).rejects.toThrow('Failed to seed bins: Location name is required and must be a string')
    })
  })

  // ---------------- GET BIN STATISTICS ----------------
  describe('getBinStatistics()', () => {
    it('should calculate statistics correctly', async () => {
      const bins = [
        { fillLevel: 10 }, // Empty
        { fillLevel: 50 }, // Half
        { fillLevel: 80 }, // Full
        { fillLevel: 100 }, // Priority
        { fillLevel: 110 }, // Priority
      ]

      mockBinDAO.findAll.mockResolvedValue(bins)

      const result = await binService.getBinStatistics()

      expect(result).toEqual({
        total: 5,
        empty: 1,
        half: 1,
        full: 1,
        priority: 2
      })
    })
  })

  // ---------------- CALCULATE STATUS ----------------
  describe('calculateStatus()', () => {
    it('should calculate status based on fill level', () => {
      expect(binService.calculateStatus(10)).toBe('Empty')
      expect(binService.calculateStatus(50)).toBe('Half')
      expect(binService.calculateStatus(80)).toBe('Full')
      expect(binService.calculateStatus(100)).toBe('Priority')
      expect(binService.calculateStatus(110)).toBe('Priority')
    })
  })
})
