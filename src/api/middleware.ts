import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { ApiError } from "./ApiError.js";

export function middlewareLogResponse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
}

export function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction,
) {
  config.fileserverHits++;
  next();
}

export function errorHandlerMiddleware(
    err: Error,
    _: Request,
    res: Response,
    __: NextFunction
): void {
    console.error("Error:", err);

    // Check if this is one of our custom API errors
    if (err instanceof ApiError) {
      // Send the error message with the appropriate status code
      res.status(err.statusCode).json({ 
        error: err.message 
      });
      return;
    }

    // For all other errors, send a generic server error
    res.status(500).json({ 
      error: "Something went wrong on our end" 
    });
}