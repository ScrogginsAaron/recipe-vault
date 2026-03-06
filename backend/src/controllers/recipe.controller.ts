import prisma from "../config/prisma";
import { createRecipeSchema } from "../validators/recipe.schema";

export const createRecipe = async (req, res, next) => {
  const { name } = req.body;

  const recipe = await prisma.recipe.create({
    data: { name },
  });

  res.status(201).json(recipe);
};

export const getRecipes = async (req, res, next) => {
  try {
    const recipes = await prisma.recipe.findMany();
    res.json(recipes);
  } catch (err) {
    next(err);
  }
};

export const attachIngredientToRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ingredientId, quantity } = req.body;

    const recipeIngredient = await prisma.recipeIngredient.create({
      data: {
        recipeId: id,
        ingredientId,
        quantity
      }
    });

    res.status(201).json(recipeIngredient);
  } catch (err) {
    next(err);
  }
};
