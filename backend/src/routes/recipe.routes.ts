import { Router } from "express";
import { createRecipe, getRecipes, attachIngredientToRecipe, getRecipeById, } from "../controllers/recipe.controller";
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

export default router;