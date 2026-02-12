import express from "express";
import prisma from "./config/prisma";
import recipeRoutes from "./routes/recipe.routes";

const app = express();

app.use(express.json());

app.use("/recipes", recipeRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/recipes", async (_req, res) => {
  const recipes = await prisma.recipe.findMany();
  res.json(recipes);
});

export default app;