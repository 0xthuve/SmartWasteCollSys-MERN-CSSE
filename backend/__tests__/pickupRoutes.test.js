import request from "supertest";
import express from "express";
import pickupRoutes from "../routes/pickupRoutes.js";
import pickupService from "../services/pickupService.js";

jest.mock("../services/pickupService.js");

const app = express();
app.use(express.json());
app.use("/api/pickups", pickupRoutes);

describe("Pickup Routes", () => {
  test("POST /api/pickups should create a pickup", async () => {
    const mockPickup = { refNumber: "REF001" };
    pickupService.createPickup.mockResolvedValue(mockPickup);

    const res = await request(app).post("/api/pickups").send(mockPickup);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockPickup);
  });

  test("GET /api/pickups should return pickups", async () => {
    const mockList = [{ refNumber: "REF1" }];
    pickupService.getAllPickups.mockResolvedValue(mockList);

    const res = await request(app).get("/api/pickups");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockList);
  });
});
