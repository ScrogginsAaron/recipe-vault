import { Router } from "express";
import { createRecipe, getRecipes, attachIngredientToRecipe } from "../controllers/recipe.controller";
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

router.post(
  "/:id/ingredients", 
  attachIngredientToRecipe
);

export default router;