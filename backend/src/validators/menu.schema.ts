import { z } from "zod";

export const generateMenuSchema = z.object({
  source: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ["all", "favorites"].includes(val), {
      message: 'invalid option: expected "all" or "favorites"',
    }),
  days: z
    .number()
    .int()
    .min(1)
    .max(14)
    .optional()
    .default(7),
});