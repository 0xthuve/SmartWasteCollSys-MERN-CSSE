import Pickup from "../models/Pickup.js";

export default class PickupDAO {
  async create(pickupData) {
    return await Pickup.create(pickupData);
  }

  async findAll() {
    return await Pickup.find();
  }

  async findByRef(refNumber) {
    return await Pickup.findOne({ refNumber });
  }

  async findById(id) {
    return await Pickup.findById(id);
  }

  async update(id, updateData) {
    return await Pickup.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Pickup.findByIdAndDelete(id);
  }
}
