const mongoose = require('mongoose')

const BinSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  fillLevel: { type: Number, default: 0 }, // 0-100 percentage
  historicalAvgFill: { type: Number, default: 0 },
  lastSeenAt: { type: Date, default: Date.now },
  // Predictive routing fields
  collectionFrequency: { type: Number, default: 0 }, // Average collections per day
  lastCollectionDate: { type: Date },
  predictiveFillRate: { type: Number, default: 0 }, // Fill rate percentage per hour
  priorityScore: { type: Number, default: 0 } // Calculated priority for collection
}, { timestamps: true })

module.exports = mongoose.model('Bin', BinSchema)
