import { z } from "zod";

export const requestInput = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    company: z.string().trim().max(150).optional().default(""),
    projectType: z.string().trim().min(2).max(100),
    budget: z.string().trim().max(50).optional().default("undecided"),
    description: z.string().trim().min(15).max(5000),
  })
  .strict();
