const express = require('express')
const router = express.Router()
const Bin = require('../models/Bin')
const fs = require('fs')
const path = require('path')

// GET /api/bins
router.get('/', async (req, res) => {
  try {
    const bins = await Bin.find().sort({ createdAt: -1 })
    res.json(bins)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/bins - add
router.post('/', async (req, res) => {
  try {
    const bin = new Bin(req.body)
    await bin.save()
    res.status(201).json(bin)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/bins/:id - update
router.put('/:id', async (req, res) => {
  try {
    const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!bin) return res.status(404).json({ error: 'Bin not found' })
    res.json(bin)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/bins/:id
router.delete('/:id', async (req, res) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id)
    if (!bin) return res.status(404).json({ error: 'Bin not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/bins/seed - load bins from a local seed file (dev convenience)
router.post('/seed', async (req, res) => {
  try {
    const file = path.join(__dirname, '..', 'bins-seed.json')
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'seed file not found' })
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    await Bin.deleteMany({})
    const inserted = await Bin.insertMany(data)
    res.json({ insertedCount: inserted.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/bins/report - sensor reports fill level { sensorId, fillLevel }
router.post('/report', async (req, res) => {
  try {
    const { sensorId, fillLevel } = req.body
    let status = 'Empty'
    if (fillLevel >= 70) status = 'Priority'
    else if (fillLevel >= 50) status = 'Full'
    else if (fillLevel >= 25) status = 'Half'
    const bin = await Bin.findOneAndUpdate({ sensorId }, { fillLevel, status, lastSeenAt: new Date() }, { new: true })
    if (!bin) return res.status(404).json({ error: 'Bin not found' })
    // Emit real-time update
    req.app.get('io').emit('binUpdate', bin)
    res.json(bin)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
