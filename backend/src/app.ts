import express from "express";
import recipeRoutes from "./routes/recipe.routes";
import ingredientRoutes from "./routes/ingredient.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use("/recipes", recipeRoutes);

app.use("/ingredients", ingredientRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;