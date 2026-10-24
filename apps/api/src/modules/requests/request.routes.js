import { Router } from "express";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "../../db/connect.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { HttpError } from "../../shared/http-errors.js";
import { ProjectRequest } from "./request.model.js";
import { requestInput } from "./request.validation.js";

export const requestRouter = Router();

requestRouter.post(
  "/",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }),
  asyncHandler(async (req, res) => {
    const parsed = requestInput.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    }
    try {
      await connectDatabase();
    } catch (error) {
      console.error("MongoDB connection unavailable", { name: error.name, message: error.message });
      throw new HttpError(503, "Database unavailable");
    }
    const record = await ProjectRequest.create(parsed.data);
    return res.status(201).json({ id: record.id, message: "Request received" });
  }),
);
