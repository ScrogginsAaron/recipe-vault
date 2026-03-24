import { Router } from "express";
import { 
  createIngredient, 
  getIngredients, 
  getIngredientById,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredient.controller";
import { validate } from "../middleware/validate";
import { 
  createIngredientSchema,
  updateIngredientSchema,
} from "../validators/ingredient.schema";
import { ingredientIdParamsSchema } from "../validators/params.schema";

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

router.get(
  "/:id",
  validate(ingredientIdParamsSchema, "params", getIngredientById),
  getIngredientById
);

router.patch(
  "/:id",
  validate(ingredientIdParamsSchema, "params"),
  validate(updateIngredientSchema),
  updateIngredient
);

router.delete(
  "/:id",
  validate(ingredientIdParamsSchema, "params"),
  deleteIngredient
);

export default router;