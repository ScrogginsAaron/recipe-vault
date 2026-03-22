import { z } from "zod";

export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long"),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .optional(),
});

export const updateRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .max(255, "Recipe name is too long")
    .optional(),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .optional(),
}).refine(
  (data) => data.name !== undefined || data.instructions !== undefined,
  {
    message: "Atleast one field must be provided",
  }
);