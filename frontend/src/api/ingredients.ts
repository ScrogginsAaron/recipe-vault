import { api } from "./client";

export type Ingredient = {
  id: string;
  name: string;
}

type IngredientsResponse = {
  success: boolean;
  data: Ingredient[];
};

type IngredientResponse = {
  success: boolean;
  data: Ingredient;
};

export async function getIngredients() {
  const response = await api.get<IngredientsResponse>("/ingredients");
  return response.data;
}

export async function createIngredient(name: string) {
  const response = await api.post<IngredientResponse>( "/ingredients", { name } );
  return response.data;
}
