import prisma from "../config/prisma";
import type { NextFunction, Request, Response } from "express";


// Transforms the favorited recipe data into the form used by the front end.
function serializeFavoriteRecipe(favorite: {
  createdAt: Date;
  recipe: {
    id: string;
    name: string;
    description: string | null;
    instructions: string[];
    mealTypes: string[];
    createdAt: Date;
    ingredients: Array<{
      quantity: string | null;
      ingredient: {
        id: string;
        name: string;
      };
    }>;
  };
}) {
  return {
    id: favorite.recipe.id,
    name: favorite.recipe.name,
    description: favorite.recipe.description,
    instructions: favorite.recipe.instructions,
    mealTypes: favorite.recipe.mealTypes,
    createdAt: favorite.recipe.createdAt,
    ingredients: favorite.recipe.ingredients.map((recipeIngredient) => ({
      id: recipeIngredient.ingredient.id,
      name: recipeIngredient.ingredient.name,
      quantity: recipeIngredient.quantity,
    })),
    favoritedAt: favorite.createdAt,
  };
}

export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipeId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    // Only allows users to favorite existing recipes.
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const favoriteKey = {
      userId_recipeId: {
        userId,
        recipeId,
      },
    };

    // Prevents duplicate favorites for the same user and recipe pair.
    const existingFavorite = await prisma.favorite.findUnique({
      where: favoriteKey,
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Recipe already in favorites",
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        recipeId,
      },
    });
 
    return res.status(201).json({
      success: true,
      message: "Recipe added to favorites",
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipeId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const favoriteKey = {
      userId_recipeId: {
        userId,
        recipeId,
      },
    };
    
    const existingFavorite = await prisma.favorite.findUnique({
      where: favoriteKey,
    });

    if (!existingFavorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await prisma.favorite.delete({
      where: favoriteKey,
    });

    return res.status(200).json({
      success: true,
      message: "Recipe removed from favorites",
    });
  } catch (err) {
    next(err);
  }
};

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedFavorites = favorites.map(serializeFavoriteRecipe);

    return res.status(200).json({
      success: true,
      message: "Favorites retrieved successfully.",
      data: formattedFavorites,
    });
  } catch(err) {
    next(err);
  } 
};
  