import { Router } from "express";
import { generateWeeklyMenu } from "../controllers/menu.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { generateMenuSchema } from "../validators/menu.schema";

const router = Router();

router.post(
  "/generate",
  requireAuth,
  validate(generateMenuSchema),
  generateWeeklyMenu
);

export default router;
