import { api } from "./client";
import type { WeeklyMenuResponse } from "../types/menu";

export async function generateWeeklyMenu(
  source: "all" | "favorites", 
  days = 7,
  startDate?: string
) {
  const response = await api.post<WeeklyMenuResponse>(
    "/menu/generate", 
    {
      source,
      days,
      startDate,
    }
  );
  
  return response.data;
}