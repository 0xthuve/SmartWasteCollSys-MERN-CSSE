const mongoose = require('mongoose')

const BinSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  fillLevel: { type: Number, default: 0 }, // 0-100 percentage
  status: { type: String, enum: ['Empty', 'Half', 'Full', 'Priority'], default: 'Empty' },
  historicalAvgFill: { type: Number, default: 0 },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Bin', BinSchema)
