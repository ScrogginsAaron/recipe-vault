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
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipe.controller";
import { validate } from "../middleware/validate";
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../validators/recipe.schema";
import {
  attachIngredientSchema,
  updateRecipeIngredientQuantitySchema,
} from "../validators/ingredient.schema";
import {
  searchByNameSchema,
  getRecipesQuerySchema,
} from "../validators/search.schema";
import { 
  recipeIdParamSchema, 
  recipeIngredientParamsSchema,
} from "../validators/params.schema";

const router = Router();

router.post(
  "/",
  validate(createRecipeSchema),
  createRecipe
);

router.get(
  "/random",
  getRandomRecipe
);

router.get(
  "/search", 
  validate(searchByNameSchema, "query"),
  searchRecipesByName
);

router.get(
  "/search/ingredient",
  validate(searchByNameSchema, "query"),
  searchRecipesByIngredient
);

router.get(
  "/:id",
  validate(recipeIdParamSchema, "params"),
  getRecipeById
);

router.patch(
  "/:id",
  validate(recipeIdParamSchema, "params"),
  validate(updateRecipeSchema),
  updateRecipe
);

router.delete(
  "/:id",
  validate(recipeIdParamSchema, "params"),
  deleteRecipe
);

router.get(
  "/",
  validate(getRecipesQuerySchema, "query"), 
  getRecipes
);

router.post(
  "/:id/ingredients",
  validate(recipeIdParamSchema, "params"),
  validate(attachIngredientSchema),
  attachIngredientToRecipe
);

router.patch(
  "/:id/ingredients/:ingredientId",
  validate(recipeIngredientParamsSchema, "params"),
  validate(updateRecipeIngredientQuantitySchema),
  updateRecipeIngredientQuantity
);

router.delete(
  "/:id/ingredients/:ingredientId", 
  validate(recipeIngredientParamsSchema, "params"),
  removeIngredientFromRecipe
);

export default router;