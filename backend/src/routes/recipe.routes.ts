import { Router } from "express";
import { 
  createRecipe, 
  getRecipes, 
  attachIngredientToRecipe, 
  getRecipeById, 
  removeIngredientFromRecipe,
} from "../controllers/recipe.controller";
import { validate } from "../middleware/validate";
import { createRecipeSchema } from "../validators/recipe.schema";

const router = Router();

router.post(
  "/",
  createRecipe
);

router.get(
  "/",
  getRecipes
);

router.get(
  "/:id",
  getRecipeById
);

router.post(
  "/:id/ingredients",
  attachIngredientToRecipe
);

router.delete("/:id/ingredients/:ingredientId", removeIngredientFromRecipe);

export default router;