import prisma from "../config/prisma";
import { createRecipeSchema } from "../validators/recipe.schema";

export const createRecipe = async (req, res, next) => {
  const { name } = req.body;

  const recipe = await prisma.recipe.create({
    data: { name },
  });

  res.status(201).json(recipe);
};

export const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
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
    
    const formattedRecipe = {
      id: recipe.id,
      name: recipe.name,
      createdAt: recipe.createdAt,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
     })),
    };

    res.status(200).json(formattedRecipe);
  } catch (err) {
    next(err);
  }
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

export const removeIngredientFromRecipe = async (req, res, next) => {
  try {
    const { id, ingredientId } = req.params;
    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId: ingredientId,
        },
      },
    });

    if (!existingRecipeIngredient) {
      return res.status(404).json({
        message: "Ingredient not attached to this recipe",
      });
    }
  
    await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });
  
    res.status(200).json({
      message: "Ingredient removed from recipe successfully",
    });
  } catch (err) {
    next(err);
  }
};
