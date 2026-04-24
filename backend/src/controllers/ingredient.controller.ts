import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

// A helper function for finding an ingredient by ID.
async function findIngredientById(id: string) {
  return prisma.ingredient.findUnique({
    where: { id },
  });
}

export const createIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
 
    const ingredient = await prisma.ingredient.create({
      data: { name },
    });

    res.status(201).json({
      success: true,
      message: "Ingredient created successfully",
      data: ingredient,
    });
  } catch (err) {
    next(err);
  }
};

export const getIngredients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Ingredients retrieved successfully.",
      data: ingredients,
    });
  } catch (err) {
    next(err);
  }
};

export const getIngredientById = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const ingredient = await findIngredientById(id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ingredient retrieved successfully",
      data: ingredient,
    });
  } catch (err) {
    next(err);
  }
};

export const updateIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingIngredient = await findIngredientById(id);

    if (!existingIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({
      success: true,
      message: "Ingredient updated successfully",
      data: updatedIngredient,
    });
  } catch (err) {
    next(err);
  } 
};

export const deleteIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingIngredient = await findIngredientById(id);

    if (!existingIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    // Removes the recipe relationships before deleting the ingredients.
    // Prevents relational constraint issues.
    await prisma.recipeIngredient.deleteMany({
      where: {
        ingredientId: id,
      },
    });

    await prisma.ingredient.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully",
    });
  } catch (err) {
    next(err)
  }
};