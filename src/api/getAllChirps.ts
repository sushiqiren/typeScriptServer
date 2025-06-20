import type { Request, Response, NextFunction } from "express";
import { getAllChirps } from "../db/queries/chirps.js";

export async function handlerGetChirps(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Retrieve all chirps from the database
    const allChirps = await getAllChirps();
    
    // Format the response
    const formattedChirps = allChirps.map(chirp => ({
      id: chirp.id,
      createdAt: chirp.createdAt,
      updatedAt: chirp.updatedAt,
      body: chirp.body,
      userId: chirp.userId
    }));
    
    // Return the chirps with a 200 status code
    res.status(200).json(formattedChirps);
  } catch (error) {
    next(error);
  }
}