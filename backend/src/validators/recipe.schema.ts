import { z } from "zod";

export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long"),
  instructions: z
    .array(z.string().min(1))
    .optional(),
});

export const updateRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long")
    .optional(),
  instructions: z
    .array(z.string().min(1))
    .optional(),
});