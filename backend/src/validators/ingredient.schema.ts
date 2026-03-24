import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(255, "Ingredient name is too long"),
});

export const attachIngredientSchema = z.object({
  ingredientId: z
    .string()
    .uuid("Invalid ingredient ID"),
  quantity: z
    .string()
    .min(1, "Quantity is required"),
});

export const updateRecipeIngredientQuantitySchema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity is required"),
});

export const updateIngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required"),
});