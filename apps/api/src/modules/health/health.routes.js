import { Router } from "express";
import { connectDatabase } from "../../db/connect.js";

export const healthRouter = Router();
healthRouter.get("/", async (_req, res) => {
  try {
    const connection = await connectDatabase();
    await connection.db.admin().ping();
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed", {
      name: error.name,
      message: error.message,
      servers: error.reason?.servers
        ? [...error.reason.servers.entries()].map(([address, details]) => ({
            address,
            error: details.error?.message,
          }))
        : undefined,
    });
    return res.status(503).json({ status: "degraded", database: "disconnected" });
  }
});
