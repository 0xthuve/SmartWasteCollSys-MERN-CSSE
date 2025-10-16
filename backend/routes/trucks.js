const express = require('express')
const router = express.Router()
const Truck = require('../models/Truck')

// GET /api/trucks - list all trucks
router.get('/', async (req, res) => {
  try {
    const trucks = await Truck.find().sort({ createdAt: -1 })
    res.json(trucks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/trucks - create a new truck
router.post('/', async (req, res) => {
  try {
    const { plate, model, capacity, status } = req.body
    const truck = new Truck({ plate, model, capacity, status })
    await truck.save()
    res.status(201).json(truck)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/trucks/:id - update truck
router.put('/:id', async (req, res) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!truck) return res.status(404).json({ error: 'Truck not found' })
    res.json(truck)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/trucks/:id - delete truck
router.delete('/:id', async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id)
    if (!truck) return res.status(404).json({ error: 'Truck not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/trucks/:id/location - update truck location (only for active trucks)
router.put('/:id/location', async (req, res) => {
  try {
    const { currentLocation } = req.body
    const truck = await Truck.findById(req.params.id)
    if (!truck) return res.status(404).json({ error: 'Truck not found' })
    if (truck.status !== 'Active') return res.status(400).json({ error: 'Cannot update location for inactive truck' })
    truck.currentLocation = currentLocation
    await truck.save()
    res.json(truck)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
