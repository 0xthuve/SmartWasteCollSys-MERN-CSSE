require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const User = require('./models/User')
const Bin = require('./models/Bin')
const Truck = require('./models/Truck')

async function seedDatabase() {
  try {
    const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/route_opt'
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    // Seed admin user
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin'
      })
      await admin.save()
      console.log('Admin user created: admin/admin123')
    } else {
      console.log('Admin user already exists: admin/admin123')
    }

    // Seed bins
    const binsFile = path.join(__dirname, 'bins-seed.json')
    if (fs.existsSync(binsFile)) {
      const binsData = JSON.parse(fs.readFileSync(binsFile, 'utf8'))
      await Bin.deleteMany({})
      await Bin.insertMany(binsData)
      console.log(`Seeded ${binsData.length} bins`)
    }

    // Seed trucks
    const trucksFile = path.join(__dirname, 'trucks-seed.json')
    if (fs.existsSync(trucksFile)) {
      const trucksData = JSON.parse(fs.readFileSync(trucksFile, 'utf8'))
      await Truck.deleteMany({})
      await Truck.insertMany(trucksData)
      console.log(`Seeded ${trucksData.length} trucks`)
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase