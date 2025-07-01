import type { Request, Response, NextFunction } from "express";
import { deleteChirp } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../utils/auth.js";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "./ApiError.js";
import { config } from "../config.js";

export async function handlerDeleteChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract chirp ID from URL parameters
    const chirpId = req.params.chirpID;
    
    if (!chirpId) {
      throw new NotFoundError("Chirp ID is required");
    }
    
    // Extract and validate JWT from the request
    let userId: string;
    try {
      const token = getBearerToken(req);
      userId = validateJWT(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError("Authentication required to delete chirps");
    }
    
    // Try to delete the chirp
    const result = await deleteChirp(chirpId, userId);
    
    // Handle different outcomes
    if (result === null) {
      throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
    }
    
    if ('forbidden' in result) {
      throw new ForbiddenError("You can only delete your own chirps");
    }
    
    // Successful deletion - return 204 No Content
    res.status(204).end();
    
  } catch (error) {
    next(error);
  }
}