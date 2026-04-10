import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  getCurrentUser 
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators/auth.schema";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  registerUser
);

router.post(
  "/login",
  validate(loginSchema),
  loginUser
);

router.get(
  "/me",
  requireAuth,
  getCurrentUser
);

export default router;
