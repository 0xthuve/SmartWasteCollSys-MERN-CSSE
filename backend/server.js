require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [process.env.VITE_APP_FRONTEND_URL || "http://localhost:5173"],
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
const truckAllocationRouter = require('./routes/truckallocation')
app.use('/api/truck-allocation', truckAllocationRouter)
const predictiveRoutingRouter = require('./routes/predictiverouting')
app.use('/api/predictive-routing', predictiveRoutingRouter)

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

// Connect to MongoDB
connectDB()

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
