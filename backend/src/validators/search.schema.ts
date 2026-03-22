import { z } from "zod";

export const searchByNameSchema = z.object({
  name: z
    .string()
    .min(1, "Search name is required"),
});