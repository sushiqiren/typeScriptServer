import type { Request, Response, NextFunction } from "express";
import { getAllChirps } from "../db/queries/chirps.js";
import { BadRequestError } from "./ApiError.js";

export async function handlerGetChirps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract the optional authorId query parameter
    const authorId = req.query.authorId as string | undefined;
    
    // Extract the optional sort query parameter
    const sortParam = req.query.sort as string | undefined;
    
    // Validate sort parameter if provided
    let sortOrder: 'asc' | 'desc' = 'asc'; // Default to ascending
    if (sortParam) {
      if (sortParam === 'asc' || sortParam === 'desc') {
        sortOrder = sortParam;
      } else {
        throw new BadRequestError("sort parameter must be 'asc' or 'desc'");
      }
    }
    
    // If authorId is present but empty, return a bad request
    if (authorId !== undefined && !authorId) {
      throw new BadRequestError("authorId cannot be empty");
    }
    
    // Get chirps with filtering and sorting
    const chirps = await getAllChirps(authorId, sortOrder);
    
    // Return the chirps
    res.status(200).json(chirps);
    
  } catch (error) {
    next(error);
  }
}