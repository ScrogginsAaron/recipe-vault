import express from "express";
import prisma from "./config/prisma";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/recipes", async (_req, res) => {
  const recipes = await prisma.recipe.findMany();
  res.json(recipes);
});

export default app;