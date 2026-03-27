import { z } from "zod";

export const favoriteRecipeParamSchema = z.object({
  recipeId: z
    .string()
    .uuid("Invalid recipe ID"),
});