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

export const generateMenuSchema = z.object({
  source: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ["all", "favorites"].includes(val), {
      message: 'invalid option: expected "all" or "favorites"',
    }),
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