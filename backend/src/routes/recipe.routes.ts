import { Router } from "express";
import { 
  createRecipe, 
  getRecipes, 
  attachIngredientToRecipe, 
  getRecipeById, 
  getRandomRecipe,
  searchRecipesByName,
  searchRecipesByIngredient,
  removeIngredientFromRecipe,
  updateRecipeIngredientQuantity,
  deleteRecipe,
} from "../controllers/recipe.controller";
import { validate } from "../middleware/validate";
import { createRecipeSchema } from "../validators/recipe.schema";

const router = Router();

router.post(
  "/",
  createRecipe
);

router.get(
  "/random",
  getRandomRecipe
);

router.get(
  "/search", 
  searchRecipesByName
);

router.get(
  "/search/ingredient",
  searchRecipesByIngredient
);

router.get(
  "/:id",
  getRecipeById
);

router.delete(
  "/:id",
  deleteRecipe
);

router.get(
  "/",
  getRecipes
);

router.post(
  "/:id/ingredients",
  attachIngredientToRecipe
);

router.patch(
  "/:id/ingredients/:ingredientId",
  updateRecipeIngredientQuantity
);

router.delete(
  "/:id/ingredients/:ingredientId", 
  removeIngredientFromRecipe
);

export default router;