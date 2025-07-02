import type { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../utils/auth.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";
import { UnauthorizedError, BadRequestError } from "./ApiError.js";
import { users } from "../db/schema.js";
import { config } from "../config.js";

// Define the full user type from the schema
type User = typeof users.$inferSelect;

// Create a safe response type that excludes the hashedPassword
type UserResponse = Omit<User, 'hashedPassword'>;

interface LoginRequest {
  email: string;
  password: string;
}

export async function handlerLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as LoginRequest;
    
    // Basic validation
    if (!data.email || !data.password || 
        typeof data.email !== 'string' || 
        typeof data.password !== 'string') {
      throw new UnauthorizedError("Incorrect email or password");
    }
    
    // Look up the user by email
    const user = await getUserByEmail(data.email);
    
    // If user doesn't exist or password doesn't match, return 401
    if (!user) {
      throw new UnauthorizedError("Incorrect email or password");
    }
    
    // Check if password matches
    const passwordMatches = await checkPasswordHash(data.password, user.hashedPassword);
    
    if (!passwordMatches) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    // Set up token expiration times
    const ONE_HOUR = 60 * 60;  // 3600 seconds for JWT
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds for refresh token
    
    // Generate access token (JWT) with 1 hour expiration
    const token = makeJWT(
      user.id,
      ONE_HOUR,
      config.jwt.secret
    );
    
    // Generate refresh token with 60 day expiration
    const refreshToken = makeRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + SIXTY_DAYS_MS);
    
    // Store refresh token in database
    await createRefreshToken(
      refreshToken, 
      user.id, 
      refreshTokenExpiresAt
    );
    
    // Create response with user data and both tokens
    const response = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isChirpyRed: user.isChirpyRed,
      token: token,
      refreshToken: refreshToken
    };
    
    // Return successful login response
    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
}