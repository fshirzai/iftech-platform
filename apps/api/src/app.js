import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { requestRouter } from "./modules/requests/request.routes.js";
import { notFound, errorHandler } from "./middleware/error-handler.js";

export const app = express();
app.disable("x-powered-by");
if (env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.use(helmet());
const origins = (env.WEB_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "40kb" }));
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/requests", requestRouter);
app.use(notFound);
app.use(errorHandler);
