const mongoose = require('mongoose')

const RoutePlanSchema = new mongoose.Schema({
  mode: { type: String, enum: ['real-time', 'predictive'], required: true },
  generatedFor: { type: Date, default: Date.now },
  routes: [
    {
      truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
      truckPlate: { type: String }, // denormalized for display
      binSensorIds: [String],
      stops: [{
        sensorId: String,
        order: Number,
        estimatedTime: Number, // minutes
        locationName: String,
        priority: { type: Boolean, default: false } // Whether this is a priority stop (100% bin)
      }],
      totalDistance: { type: Number, default: 0 }, // km
      estimatedTimeMin: Number,
      status: { type: String, enum: ['planned', 'dispatched', 'in-progress', 'completed'], default: 'planned' },
      priorityRoute: { type: Boolean, default: false } // Whether this route contains priority bins
    }
  ],
  approved: { type: Boolean, default: false },
  dispatchedAt: Date,
  completedAt: Date,
  efficiency: {
    timeSaved: { type: Number, default: 0 }, // minutes
    distanceSaved: { type: Number, default: 0 }, // km
    fuelSaved: { type: Number, default: 0 } // liters
  }
}, { timestamps: true })

module.exports = mongoose.model('RoutePlan', RoutePlanSchema)
