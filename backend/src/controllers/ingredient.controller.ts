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

    res.status(201).json(ingredient);
  } catch (err) {
    next(err);
  }
};