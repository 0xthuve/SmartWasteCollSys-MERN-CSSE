const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  bins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bin' }],
  generalWaste: { type: Number, default: 0 },
  recyclables: { type: Number, default: 0 },
  organic: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Collection', CollectionSchema);
