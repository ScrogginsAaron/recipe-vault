import { Router } from "express";
import { createRecipe, getRecipeById, getRecipes, attachIngredientToRecipe } from "../controllers/recipe.controller";
import { validate } from "../middleware/validate";
import { createRecipeSchema } from "../validators/recipe.schema";

const router = Router();

router.post(
  "/",
  validate(createRecipeSchema),
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