import { Router } from "express";
import { addFavorite, removeFavorite, getFavorites } from "../controllers/favorite.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { favoriteRecipeParamSchema } from "../validators/favorite.schema";

const router = Router();

router.get(
  "/",
  requireAuth,
  getFavorites
);

router.post(
  "/:recipeId",
  requireAuth, 
  validate(favoriteRecipeParamSchema, "params"),
  addFavorite
);

router.delete(
  "/:recipeId",
  requireAuth,
  validate(favoriteRecipeParamSchema, "params"),
  removeFavorite
);

export default router;