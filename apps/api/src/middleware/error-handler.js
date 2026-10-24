import { env } from "../config/env.js";
import { HttpError } from "../shared/http-errors.js";

export function notFound(_req, _res, next) {
  next(new HttpError(404, "Not found"));
}

export function errorHandler(error, _req, res, _next) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error("API error", { name: error.name, message: error.message });
  return res.status(status).json({
    error: status === 500 ? "Internal server error" : error.message,
    ...(error instanceof HttpError && error.details ? { details: error.details } : {}),
  });
}
