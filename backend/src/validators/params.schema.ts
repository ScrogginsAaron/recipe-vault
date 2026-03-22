import { z } from "zod";

export const recipeIdParamSchema = z.object({
  id: z
    .string()
    .uuid("Invalid recipe ID"),
});

export const recipeIngredientParamsSchema = z.object({
  id: z
    .string()
    .uuid("invalid recipe ID"),
  ingredientId: z
    .string()
    .uuid("Invalid ingredient ID"),
});

export const ingredientIdParamsSchema = z.object({
  id: z
    .string()
    .uuid("Invalid ingredient ID"),
});