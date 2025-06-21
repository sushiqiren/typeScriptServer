import type { Request, Response, NextFunction } from "express";
import { getChirpById } from "../db/queries/chirps.js";
import { NotFoundError } from "./ApiError.js";

export async function handlerGetChirpById(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const chirpId = req.params.chirpID;
    
    if (!chirpId) {
      throw new NotFoundError("Chirp ID is required");
    }
    
    const chirp = await getChirpById(chirpId);
    
    if (!chirp) {
      throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
    }
    
    // Return the chirp with a 200 status code
    res.status(200).json({
      id: chirp.id,
      createdAt: chirp.createdAt,
      updatedAt: chirp.updatedAt,
      body: chirp.body,
      userId: chirp.userId
    });
  } catch (error) {
    next(error);
  }
}