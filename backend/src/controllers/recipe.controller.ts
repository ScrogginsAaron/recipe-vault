import prisma from "../config/prisma";
import { createRecipeSchema } from "../validators/recipe.schema";

export const createRecipe = async (req, res) => {
  const { name } = req.body;

  const recipe = await prisma.recipe.create({
    data: { name },
  });

  res.status(201).json(recipe);
};