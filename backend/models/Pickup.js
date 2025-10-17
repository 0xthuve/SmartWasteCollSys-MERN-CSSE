import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
  {
    refNumber: { type: String, required: true, unique: true },
    method: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    items: [
      {
        name: { type: String },
        quantity: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
      },
    ],
    totalWeight: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    address: { type: String, required: true },
    specialInstructions: { type: String },
  },
  { timestamps: true }
);

const Pickup = mongoose.model("Pickup", pickupSchema);
export default Pickup;
