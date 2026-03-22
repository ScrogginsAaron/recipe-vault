import { Router } from "express";
import { 
  createIngredient, 
  getIngredients 
} from "../controllers/ingredient.controller";
import { validate } from "../middleware/validate";
import { createIngredientSchema } from "../validators/ingredient.schema";

const router = Router();

router.post(
  "/", 
  validate(createIngredientSchema), 
  createIngredient
);

router.get(
  "/", 
  getIngredients
);

export default router;