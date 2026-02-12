import { Router } from "express";
import { createRecipe } from "../controllers/recipe.controller";
import { validate } from "../middleware/validate";
import { createRecipeSchema } from "../validators/recipe.schema";

const router = Router();

router.post(
  "/",
  validate(createRecipeSchema),
  createRecipe
);

export default router;