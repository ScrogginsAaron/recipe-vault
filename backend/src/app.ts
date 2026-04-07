import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import recipeRoutes from "./routes/recipe.routes";
import ingredientRoutes from "./routes/ingredient.routes";
import favoriteRoutes from "./routes/favorite.routes";
import menuRoutes from "./routes/menu.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/recipes", recipeRoutes);

app.use("/ingredients", ingredientRoutes);

app.use("/favorites", favoriteRoutes);

app.use("/menu", menuRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;