import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodTypeAny, source: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try{
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      next(err);
    }
  };