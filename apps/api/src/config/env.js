import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().startsWith("mongodb").optional(),
  WEB_ORIGIN: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid server configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}
export const env = parsed.data;
