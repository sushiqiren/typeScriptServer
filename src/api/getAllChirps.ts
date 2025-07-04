import type { Request, Response, NextFunction } from "express";
import { getAllChirps } from "../db/queries/chirps.js";
import { BadRequestError } from "./ApiError.js";

export async function handlerGetChirps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract the optional authorId query parameter
    const authorId = req.query.authorId as string | undefined;

    // If authorId is present but empty, return a bad request
    if (authorId !== undefined && !authorId) {
      throw new BadRequestError("authorId cannot be empty");
    }

    // Retrieve all chirps from the database
    const chirps = await getAllChirps(authorId);
    
    // // Format the response
    // const formattedChirps = allChirps.map(chirp => ({
    //   id: chirp.id,
    //   createdAt: chirp.createdAt,
    //   updatedAt: chirp.updatedAt,
    //   body: chirp.body,
    //   userId: chirp.userId
    // }));
    
    // Return the chirps with a 200 status code
    res.status(200).json(chirps);
  } catch (error) {
    next(error);
  }
}