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
  currentLocation: { type: String, default: 'Kilinochchi Town' }
}, { timestamps: true })

module.exports = mongoose.model('Truck', TruckSchema)
