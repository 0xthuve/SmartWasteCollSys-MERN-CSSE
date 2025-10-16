require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
})

app.use(express.json())
app.use(cors())

// Mount routes
const { router: authRouter } = require('./routes/auth')
app.use('/api/auth', authRouter)
const trucksRouter = require('./routes/trucks')
app.use('/api/trucks', trucksRouter)
const binsRouter = require('./routes/bins')
app.use('/api/bins', binsRouter)
const routePlansRouter = require('./routes/routeplans')
app.use('/api/routeplans', routePlansRouter)
const collectionsRouter = require('./routes/collections')
app.use('/api/collections', collectionsRouter)
const reportsRouter = require('./routes/reports')
app.use('/api/reports', reportsRouter)

// Default route
app.get('/', (req, res) => res.send('Hello, Node.js Backend is running!'))

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Make io available in routes
app.set('io', io)

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/route_opt'

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
  })
