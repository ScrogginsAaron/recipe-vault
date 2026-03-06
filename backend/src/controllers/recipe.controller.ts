import prisma from "../config/prisma";
import { createRecipeSchema } from "../validators/recipe.schema";

export const createRecipe = async (req, res) => {
  const { name } = req.body;

  const recipe = await prisma.recipe.create({
    data: { name },
  });

  res.status(201).json(recipe);
};

export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

export const getRecipes = async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
    
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipes" });
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
  