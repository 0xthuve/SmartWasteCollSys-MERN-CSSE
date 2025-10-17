import express from "express";
import {
  createPickup,
  getPickups,
  getPickupByRef,
  getPickupById,
  updatePickup,
  deletePickup,
} from "../controllers/pickupController.js";

const router = express.Router();

router.post("/", createPickup);
router.get("/", getPickups);
router.get("/:refNumber", getPickupByRef);
router.get("/id/:id", getPickupById);
router.put("/:id", updatePickup);
router.delete("/:id", deletePickup);

export default router;
