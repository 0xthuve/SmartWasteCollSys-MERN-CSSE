import express from "express";
import cors from "cors";
import pickupRoutes from "./routes/pickupRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/pickups", pickupRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("♻️ E-Waste Collection API is running...");
});

export default app;
