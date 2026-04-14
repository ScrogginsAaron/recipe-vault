import { api } from "./client";

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  name: string;
  description?: string;
  instructions?: string[];
  mealTypes?: string[];
  createdAt: string;
  ingredients: RecipeIngredient[];
};

type RecipesResponse = {
  success: boolean;
  data: Recipe[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function getRecipes(page = 1, limit = 12) {
  const response = await api.get<RecipesResponse>("/recipes", {
    params: { page, limit },
  });

  return response.data;
}

export async function searchRecipesByName(name: string) {
  const response = await api.get<RecipeResponse>("/recipes/search", {
    params: { name },
  });

  return response.data;
}

export async function searchRecipesByIngredient(name: string) {
  const response = await api.get<RecipesResponse>("/recipes/search/ingredient", {
    params: { name },
  });

  return response.data;
}