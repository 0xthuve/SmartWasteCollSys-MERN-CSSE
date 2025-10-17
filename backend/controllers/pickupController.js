import pickupService from "../services/pickupService.js";

export const createPickup = async (req, res) => {
  try {
    const newPickup = await pickupService.createPickup(req.body);
    res.status(201).json(newPickup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPickups = async (req, res) => {
  try {
    const pickups = await pickupService.getAllPickups();
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPickupByRef = async (req, res) => {
  try {
    const pickup = await pickupService.getPickupByRef(req.params.refNumber);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });
    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPickupById = async (req, res) => {
  try {
    const pickup = await pickupService.getPickupById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });
    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePickup = async (req, res) => {
  try {
    const updatedPickup = await pickupService.updatePickup(req.params.id, req.body);
    res.json(updatedPickup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePickup = async (req, res) => {
  try {
    await pickupService.deletePickup(req.params.id);
    res.json({ message: "Pickup deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
