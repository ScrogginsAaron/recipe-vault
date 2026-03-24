import { z } from "zod";

export const searchByNameSchema = z.object({
  name: z
    .string()
    .min(1, "Search name is required"),
});

export const getRecipesQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1),
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10),
  sortBy: z
    .enum(["createdAt", "name"])
    .optional()
    .default("createdAt"),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),
});