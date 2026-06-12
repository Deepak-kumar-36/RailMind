import { Router } from "express";
import { fetchSimulatedTrainData } from "../services/railwayApi";

export const trainsRouter = Router();

// GET /api/trains/:number
trainsRouter.get("/:number", async (req, res) => {
  const { number } = req.params;
  try {
    const data = await fetchSimulatedTrainData(number);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch train data" });
  }
});
