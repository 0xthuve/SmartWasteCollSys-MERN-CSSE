import PickupDAO from "../dao/pickupDAO.js";

/**
 * Service layer for handling Pickup business logic.
 */
class PickupService {
  constructor(pickupDAO = new PickupDAO()) {
    this.pickupDAO = pickupDAO;
  }

  async createPickup(data) {
    if (!data || !Array.isArray(data.items)) {
      throw new Error("Invalid pickup data: items list required");
    }

    const totalQuantity = data.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const totalWeight = data.items.reduce(
      (sum, item) => sum + (item.weight || 0),
      0
    );

    const pickupData = {
      ...data,
      totalQuantity,
      totalWeight,
    };

    return await this.pickupDAO.create(pickupData);
  }

  async getAllPickups() {
    return await this.pickupDAO.findAll();
  }

  async getPickupByRef(refNumber) {
    return await this.pickupDAO.findByRef(refNumber);
  }

  async deletePickup(id) {
    return await this.pickupDAO.deleteById(id);
  }
}

export default new PickupService();
