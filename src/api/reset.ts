import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "./ApiError.js";

export async function handlerReset(_: Request, res: Response, next: NextFunction): Promise<void> {
  // config.fileserverHits = 0;
  // res.write("Hits reset to 0");
  // res.end();
  try {
    // Only allow this endpoint in development
    if (config.platform !== "dev") {
      throw new ForbiddenError("Reset endpoint is only available in development environment");
    }
    
    // Reset the hit count
    config.fileserverHits = 0;
    
    // Delete all users
    await deleteAllUsers();
    
    // Send success response
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send("Hits reset to 0 and all users deleted");
  } catch (error) {
    next(error);
  }
}
