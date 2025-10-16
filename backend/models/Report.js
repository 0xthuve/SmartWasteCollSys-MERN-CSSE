const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'efficiency'], required: true },
  period: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  data: {
    totalCollections: { type: Number, default: 0 },
    totalBinsEmptied: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // km
    totalTime: { type: Number, default: 0 }, // minutes
    averageFillLevel: { type: Number, default: 0 },
    efficiency: {
      timeSaved: { type: Number, default: 0 }, // minutes
      distanceSaved: { type: Number, default: 0 }, // km
      fuelSaved: { type: Number, default: 0 } // liters
    },
    truckUtilization: [{
      truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
      truckPlate: String,
      routesCompleted: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 },
      totalTime: { type: Number, default: 0 }
    }],
    binPerformance: [{
      sensorId: String,
      location: {
        lat: Number,
        lng: Number
      },
      averageFillRate: Number,
      collectionFrequency: Number,
      overflowIncidents: { type: Number, default: 0 }
    }]
  },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Report', ReportSchema)