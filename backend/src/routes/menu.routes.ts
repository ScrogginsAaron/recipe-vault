import { Router } from "express";
import { 
  generateWeeklyMenu, 
  rerollMenuRecipe,
} from "../controllers/menu.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  generateMenuSchema,
  rerollMenuRecipeSchema,
} from "../validators/menu.schema";

const router = Router();

router.post(
  "/generate",
  requireAuth,
  validate(generateMenuSchema),
  generateWeeklyMenu
);

router.post(
  "/reroll",
  requireAuth,
  validate(rerollMenuRecipeSchema),
  rerollMenuRecipe
);

export default router;
