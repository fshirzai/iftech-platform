import mongoose from "mongoose";
import { env } from "../config/env.js";

let pendingConnection;

/** Reuse MongoDB connections within warm serverless instances. */
export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");

  if (!pendingConnection) {
    pendingConnection = mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 5 })
      .catch((error) => {
        pendingConnection = undefined;
        throw error;
      });
  }
  await pendingConnection;
  return mongoose.connection;
}
