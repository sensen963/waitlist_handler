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
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR"),
      message,
    },
  });
};
