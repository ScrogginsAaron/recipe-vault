import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema, source = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
  try{
    req[source] = schema.parse(req[source]);
    next();
  } catch (err) {
    next(err);
  }
};