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

export async function rerollMenuRecipe(
  source: "all" | "favorites",
  dayIndex: number,
  mealType: "breakfast" | "lunch" | "dinner",
  excludeRecipeId: string,
  usedRecipeIds: string[],
  currentMenu: any[]
) {
  const response = await api.post("/menu/reroll", {
    source,
    dayIndex,
    mealType,
    excludeRecipeId,
    usedRecipeIds,
    currentMenu,
  });

  return response.data;
}