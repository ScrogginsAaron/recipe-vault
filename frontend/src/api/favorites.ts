import { api } from "./client";

export async function getFavorites() {
  const response = await api.get("/favorites");
  return response.data;
}

export async function addFavorite(recipeId: string) {
  const response = await api.post(`/favorites/${recipeId}`);
  return response.data;
}

export async function removeFavorite(recipeId: string) {
  const response = await api.delete(`/favorites/${recipeId}`);
  return response.data;
}