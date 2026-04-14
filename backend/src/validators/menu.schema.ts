import { z } from "zod";

function isValidLocalDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === month -1 &&
    parsed.getDate() === day
  );
}

const sourceSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((val) => ["all", "favorites"].includes(val), {
    message: 'invalid option: expected "all" or "favorites"',
  });

const recipeIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string(),
});

const formattedRecipeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  instructions: z.array(z.string()).optional(),
  mealTypes: z.array(z.string()).optional(),
  createdAt: z.any().optional(),
  ingredients: z.array(recipeIngredientSchema),
});

const menuDaySchema = z.object({
  day: z.string(),
  date: z.string().refine(isValidLocalDateString, {
    message: "Invalid date in currentMenu. Use YYYY-MM-DD format.",
  }),
  meals: z.object({
    breakfast: formattedRecipeSchema,
    lunch: formattedRecipeSchema,
    dinner: formattedRecipeSchema,
  }),
});

const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);

export const generateMenuSchema = z.object({
  source: sourceSchema,
  days: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(14)
    .optional()
    .default(7),
  startDate: z
    .string()
    .refine(isValidLocalDateString, {
      message: "Invalid startDate. Use YYYY-MM-DD format.",
    })
    .optional(),
});

export const rerollMenuRecipeSchema = z.object({
  source: sourceSchema,
  dayIndex: z
    .coerce
    .number()
    .int()
    .min(0),
  mealType: mealTypeSchema,
  excludeRecipeId: z
    .string()
    .uuid(),
  usedRecipeIds: z
    .array(z
      .string()
      .uuid()
    )
    .optional()
    .default([]),
  currentMenu:z
    .array(menuDaySchema)
    .min(1),
});
