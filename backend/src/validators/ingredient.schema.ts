import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(255, "Ingredient name is too long"),
});