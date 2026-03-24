import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("API Error:", err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: err.issues });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ error: message });
};
