import express from "express";
import prisma from "./config/prisma";
import recipeRoutes from "./routes/recipe.routes";
import ingredientRoutes from "./routes/ingredient.routes";
import { validate } from "./middleware/validate";

const app = express();

app.use(express.json());

app.use("/recipes", recipeRoutes);

app.use("/ingredients", ingredientRoutes);

app.use(validate);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


export default app;