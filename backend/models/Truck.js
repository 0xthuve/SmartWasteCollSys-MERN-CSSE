const mongoose = require('mongoose')

const TruckSchema = new mongoose.Schema({
  plate: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  capacity: { type: String },
  status: { type: String, enum: ['Active', 'In Maintenance', 'Inactive'], default: 'Active' },
  driver: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  currentLocation: { type: String, default: 'Kilinochchi Town' },
  // Fuel management fields
  fuelCapacity: { type: Number, required: true, default: 100 }, // Fuel tank capacity in liters
  currentFuelLevel: { type: Number, required: true, default: 100 }, // Current fuel level in liters
  fuelEfficiency: { type: Number, required: true, default: 20 } // km per liter (1L = 20km)
}, { timestamps: true })

module.exports = mongoose.model('Truck', TruckSchema)
