export type IngredientSummaryItem = {
  name: string;
  quantities: string[];
  totalQuantity: string | null;
  unparsedQuantities?: string[];
  notes?: string[];
};

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string | null;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  mealTypes: string[];
  createdAt: string;
  ingredients: RecipeIngredient[];
};

export type MenuDay = {
  day: string;
  meals: {
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
  };
};

export type WeeklyMenuResponse = {
  success: boolean;
  message: string;
  data: {
    menu: MenuDay[];
    ingredientsSummary: IngredientSummaryItem[];
  };
};