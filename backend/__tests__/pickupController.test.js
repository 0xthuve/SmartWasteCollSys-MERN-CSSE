import * as pickupController from "../controllers/pickupController.js";
import pickupService from "../services/pickupService.js";

jest.mock("../services/pickupService.js");

describe("PickupController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createPickup should return 201 and created pickup", async () => {
    const mockPickup = { refNumber: "REF001" };
    pickupService.createPickup.mockResolvedValue(mockPickup);
    req.body = mockPickup;

    await pickupController.createPickup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPickup);
  });

  test("getPickups should return list of pickups", async () => {
    const mockPickups = [{ refNumber: "R1" }];
    pickupService.getAllPickups.mockResolvedValue(mockPickups);

    await pickupController.getPickups(req, res);

    expect(res.json).toHaveBeenCalledWith(mockPickups);
  });

  test("getPickupByRef should handle not found", async () => {
    pickupService.getPickupByRef.mockResolvedValue(null);
    req.params = { refNumber: "XYZ" };

    await pickupController.getPickupByRef(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pickup not found" });
  });

  test("deletePickup should return success message", async () => {
    req.params = { id: "123" };
    pickupService.deletePickup.mockResolvedValue(true);

    await pickupController.deletePickup(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Pickup deleted successfully" });
  });
});
