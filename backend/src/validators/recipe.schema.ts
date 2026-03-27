import { z } from "zod";

const mealTypeEnum = z.enum(["breakfast", "lunch", "dinner", "dessert"]);

export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long"),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .optional(),
  mealTypes: z
    .array(mealTypeEnum)
    .optional(),
});

export const updateRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long")
    .optional(),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .optional(),
  mealTypes: z
    .array(mealTypeEnum)
    .optional(),
}).refine(
  (data) => 
    data.name !== undefined || 
    data.description !== undefined ||
    data.instructions !== undefined ||
    data.mealTypes !== undefined,
  {
    message: "Atleast one field must be provided",
  }
);