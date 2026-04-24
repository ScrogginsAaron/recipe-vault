import prisma from "../config/prisma";
import type { NextFunction, Request, Response } from "express";

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: true,
    },
  },
};

type RecipeWithIngredients = {
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

function formatRecipe(recipe: RecipeWithIngredients) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    instructions: recipe.instructions,
    mealTypes: recipe.mealTypes,
    createdAt: recipe.createdAt,
    ingredients: recipe.ingredients?.map((recipeIngredient) => ({
      id: recipeIngredient.ingredient.id,
      name: recipeIngredient.ingredient.name,
      quantity: recipeIngredient.quantity,
    })) ?? [],
  };
}

export const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const { name, description, instructions, mealTypes } = req.body;

    const recipe = await prisma.recipe.create({
      data: { 
        name,
        description: description ?? "",
        instructions: instructions ?? [],
        mealTypes: mealTypes ?? [],
      },
    });

    return res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  }  catch (err) {
    next(err);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude,
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: "Recipe not found" 
      });
    }
 
    formattedRecipe = formatRecipe(recipe);   

    return res.status(200).json({
      success: true,
      message: "Recipe retrieved successfully",
      data: formattedRecipe,
    });
  } catch (err) {
    next(err);
  }
};

export const searchRecipesByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.query;

    if(!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'name' is required",
      });
    }
    
    const recipes = await prisma.recipe.findMany({
      where: {
        name: {
          contains: name.trim(),
          mode: "insensitive",
        },
      },
      include: recipeInclude,
    });
  
    const formattedRecipes = recipes.map(formatRecipe);

    return res.status(200).json({
      success: true,
      message: "Recipe(s) retrieved successfully.",
      data: formattedRecipes,
    });
  } catch (err) {
    next(err);
  }
};

export const searchRecipesByIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'name' is required",
      });
    }
  
    const recipes = await prisma.recipe.findMany({
      where: {
        ingredients: {
          some: {
            ingredient: {
              name: {
                contains: name.trim(),
                mode: "insensitive",
              },
            },
          },
        },
      },
      include: recipeInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRecipes = recipes.map(formatRecipe);
    
    return res.status(200).json({
      success: true,
      message: "Recipe(s) retrieved successfully.",
      data: formattedRecipes,
    });
  } catch (err) {
    next(err);
  }
};

export const getRandomRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await prisma.recipe.count();
    
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipes found",
      });
    }

    const randomIndex = Math.floor(Math.random() * count);
  
    const recipes = await prisma.recipe.findMany({
      skip: randomIndex,
      take: 1,
      include: recipeInclude,
    });

    const recipe = recipes[0];

    const formattedRecipe = formatRecipe(recipe);

    return res.status(200).json({
      success: true,
      message: "Recipe retrieved successfully.",
      data: formattedRecipe,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecipes = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const validSortFields = ["createdAt", "name"] as const;
    const validOrders = ["asc", "desc"] as const;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const safeSortBy = validSortFields.includes(
      sortBy as (typeof validSortFields)[number]
    )
      ? sortBy
      : "createdAt";

    const safeOrder = validOrders.includes(order as (typeof validOrders)[number])
      ? order
      : "desc";

    const totalRecipes = await prisma.recipe.count();

    const recipes = await prisma.recipe.findMany({
      skip,
      take: limitNumber,
      orderBy: {
        [safeSortBy as string]: safeOrder,
      },
      include: recipeInclude,
    });

    return res.status(200).json({
      success: true,
      data: recipes.map(formatRecipe),
      pagination: {
        total: totalRecipes,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalRecipes / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const attachIngredientToRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { ingredientId, quantity } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!existingIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        }
      }
    });

    if (existingRecipeIngredient) {
      return res.status(409).json({
        success: false,
        message: "Ingredient already attached to this recipe",
      });
    }

    const recipeIngredient = await prisma.recipeIngredient.create({
      data: {
        recipeId: id,
        ingredientId,
        quantity
      }
    });

    return res.status(201).json({
      success: true,
      message: "Ingredient attached to recipe successfully",
      data: recipeIngredient,
    });
  } catch (err) {
    next(err);
  }
};

export const removeIngredientFromRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, ingredientId } = req.params;

    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });

    if (!existingRecipeIngredient) {
      return res.status(404).json({
        success: false,
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
  
    return res.status(200).json({
      success: true,
      message: "Ingredient removed from recipe successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
   
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if(!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Remove related records first so that deleting the recipe doesn't fail due to relationships.
    await prisma.favorite.deleteMany({
      where: { recipeId: id },
    });

    await prisma.recipeIngredient.deleteMany({
      where: {
        recipeId: id,
      },
    });

    await prisma.recipe.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipeIngredientQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, ingredientId } = req.params;
    const { quantity } = req.body;

    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });
 
    if (!existingRecipeIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not attached to this recipe",
      });
    }

    const updatedRecipeIngredient = await prisma.recipeIngredient.update({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
      data: {
        quantity,
      },
      include: {
        ingredient: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ingredient quantity updated successfully",
      data: {
        recipeId: updatedRecipeIngredient.recipeId,
        ingredientId: updatedRecipeIngredient.ingredientId,
        ingredientName: updatedRecipeIngredient.ingredient.name,
        quantity: updatedRecipeIngredient.quantity,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, instructions, mealTypes } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(mealTypes !== undefined && { mealTypes }),
      },
      include: recipeInclude,
    });

    return res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: formatRecipe(updatedRecipe),
    });
  } catch (err) {
    next(err);
  }
};
