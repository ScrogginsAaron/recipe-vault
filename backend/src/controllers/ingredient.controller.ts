import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

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
    const ingredients = await prisma.ingredient.findMany();
    res.status(200).json({
      success: true,
      data: ingredients,
    });
  } catch (err) {
    next(err);
  }
};