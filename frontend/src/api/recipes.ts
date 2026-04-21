import { api } from "./client";

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string | null;
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

export type RecipePayload = {
  name: string;
  description?: string;
  insructions?: string[];
  mealTypes?: string[];
}

export type RecipeIngredientPayload = {
  ingredientId: string;
  quantity: string | null;
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

type RecipeResponse = {
  success: boolean;
  data: Recipe;
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

export async function createRecipe(payload: RecipePayload) {
  const response = await api.post<RecipeResponse>("/recipes", payload);
  return response.data;
}

export async function updateRecipe(
  recipeId: string,
  payload: Partial<RecipePayload>
){
  const response = await api.patch<RecipeResponse>(`/recipes/${recipeId}`, payload);
  return response.data;
}

export async function deleteRecipe(recipeId: string) {
  const response = await api.delete<{ 
    success: boolean;
    message: string
  }>(
    `/recipes/${recipeId}`
  );
  return response.data;
}

export async function attachIngredientToRecipe(
  recipeId: string,
  payload: RecipeIngredientPayload
) {
  const response = await api.post(
    `/recipes/${recipeId}/ingredients`, 
    payload
  );
  return response.data;
}

export async function updateRecipeIngredientQuantity(
  recipeId: string,
  ingredientId: string,
  quantity: string
) {
  const response = await api.patch(
    `/recipes/${recipeId}/ingredients/${ingredientId}`,
    { quantity }
  );
  return response.data;
}

export async function removeIngredientFromRecipe(
  recipeId: string,
  ingredientId: string
){
  const response = await api.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
  return response.data;
}