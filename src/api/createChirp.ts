import type { Request, Response, NextFunction } from "express";
import { createChirp } from "../db/queries/chirps.js";
import { BadRequestError, NotFoundError } from "./ApiError.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

interface ChirpRequest {
  body: string;
  userId: string;
}

export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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

    // Validate user ID
    if (!data.userId || typeof data.userId !== "string") {
      throw new BadRequestError("User ID is required and must be a string");
    }

    // Verify that the user exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);
      
    if (userExists.length === 0) {
      throw new NotFoundError(`User with ID ${data.userId} does not exist`);
    }
    
    // Clean the chirp text (removing banned words)
    const cleanedBody = cleanChirp(data.body);
    
    // Create the chirp in the database
    const newChirp = await createChirp({
      body: cleanedBody,
      userId: data.userId,
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