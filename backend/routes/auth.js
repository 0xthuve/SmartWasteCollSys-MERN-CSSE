const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const router = express.Router()

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Access denied' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' })
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me - verify token and get user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { id: user._id, username: user.username, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/register - for initial admin setup
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body
    const user = new User({ username, password, name, role: 'admin' })
    await user.save()
    res.status(201).json({ message: 'Admin user created' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = { router, authenticate }