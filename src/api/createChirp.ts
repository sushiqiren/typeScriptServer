import type { Request, Response, NextFunction } from "express";
import { createChirp } from "../db/queries/chirps.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./ApiError.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getBearerToken, validateJWT } from "../utils/auth.js";
import { config } from "../config.js";

interface ChirpRequest {
  body: string;
}

export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract and validate JWT from the request
    let userId: string;
    try {
      const token = getBearerToken(req);
      userId = validateJWT(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError("Authentication required to create chirps");
    }
    
    const data = req.body as ChirpRequest;
    
    // Validate chirp body
    if (!data.body || typeof data.body !== "string") {
      throw new BadRequestError("Chirp body is required and must be a string");
    }
    
    if (data.body.trim().length === 0) {
      throw new BadRequestError("Chirp body cannot be empty");
    }
    
    const maxChirpLength = 140;
    if (data.body.length > maxChirpLength) {
      throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }

    // Verify that the user exists (the token could reference a deleted user)
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    if (userExists.length === 0) {
      throw new NotFoundError(`User does not exist`);
    }
    
    // Clean the chirp text (removing banned words)
    const cleanedBody = cleanChirp(data.body);
    
    // Create the chirp in the database using the user ID from the token
    const newChirp = await createChirp({
      body: cleanedBody,
      userId: userId,
    });
    
    // Return the created chirp
    res.status(201).json({
      id: newChirp.id,
      createdAt: newChirp.createdAt,
      updatedAt: newChirp.updatedAt,
      body: newChirp.body,
      userId: newChirp.userId,
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * Cleans the chirp text by replacing banned words with asterisks
 */
function cleanChirp(text: string): string {
  const bannedWords = ['kerfuffle', 'sharbert', 'fornax'];
  
  const words = text.split(/\b/);
  const cleanedWords = words.map(word => {
    if (/[a-zA-Z]/.test(word)) {
      const wordLower = word.toLowerCase();
      if (bannedWords.includes(wordLower)) {
        return '****';
      }
    }
    return word;
  });
  
  return cleanedWords.join('');
}