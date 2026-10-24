
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "40kb" }));

// Reuse the database connection within warm Vercel instances.
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
}

// Model
const requestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: String,
    projectType: { type: String, required: true },
    budget: String,
    description: { type: String, required: true },
    status: {
      type: String,
      default: "NEW",
      enum: ["NEW", "REVIEWING", "CONTACTED", "CLOSED"],
    },
  },
  { timestamps: true }
);

const Request =
  mongoose.models.ProjectRequest ||
  mongoose.model("ProjectRequest", requestSchema);

// Request validation
const input = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    company: z.string().trim().max(150).optional().default(""),
    projectType: z.string().trim().min(2).max(100),
    budget: z.string().max(50).optional().default("undecided"),
    description: z.string().trim().min(15).max(5000),
  })
  .strict();

// Health
app.get("/api/v1/health", async (_req, res) => {
  try {
    await connectDB();

    // Verify database connectivity, not only Mongoose state.
    await mongoose.connection.db.admin().ping();

    return res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("MongoDB health check failed:", {
      name: error.name,
      message: error.message,
      reason: error.reason?.message,
      servers: error.reason?.servers
        ? [...error.reason.servers.entries()].map(([address, server]) => ({
            address,
            error: server.error?.message,
          }))
        : undefined,
    });

    return res.status(503).json({
      status: "degraded",
      database: "disconnected",
    });
  }
});

// Customer project requests
app.post(
  "/api/v1/requests",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  async (req, res) => {
    const parsed = input.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      await connectDB();

      const record = await Request.create(parsed.data);

      return res.status(201).json({
        id: record.id,
        message: "Request received",
      });
    } catch (error) {
      console.error("Request submission failed:", error);

      return res.status(503).json({
        error: "Unable to process request",
      });
    }
  }
);

// Not found
app.use((_req, res) => {
  return res.status(404).json({
    error: "Not found",
  });
});

// Local development only
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.log(`IFTECH API listening on ${port}`);
  });
}

// Vercel entry point
export default app;
