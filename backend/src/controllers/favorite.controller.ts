import prisma from "../config/prisma";

export const addFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
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

export const removeFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!existingFavorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Recipe removed from favorites",
    });
  } catch (err) {
    next(err);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
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

    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.recipe.id,
      name: favorite.recipe.name,
      description: favorite.recipe.description,
      instructions: favorite.recipe.instructions,
      mealTypes: favorite.recipe.mealTypes,
      createdAt: favorite.recipe.createdAt,
      ingredients: favorite.recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
      })),
      favoritedAt: favorite.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedFavorites,
    });
  } catch(err) {
    next(err);
  } 
};
  