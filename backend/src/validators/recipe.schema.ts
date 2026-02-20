import { z } from "zod";

export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long"),
});
