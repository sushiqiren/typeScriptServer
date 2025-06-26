import type { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT } from "../utils/auth.js";
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
  expiresInSeconds?: number;
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

    // Validate expiresInSeconds if provided
    if (data.expiresInSeconds !== undefined) {
      if (typeof data.expiresInSeconds !== 'number' || data.expiresInSeconds <= 0) {
        throw new BadRequestError("expiresInSeconds must be a positive number");
      }
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

    // Determine token expiration time (in seconds)
    const ONE_HOUR = 60 * 60;  // 3600 seconds
    let expiresIn = ONE_HOUR;  // Default to 1 hour
    
    if (data.expiresInSeconds !== undefined) {
      // Use client-provided value, but cap at 1 hour
      expiresIn = Math.min(data.expiresInSeconds, ONE_HOUR);
    }
    
    // Generate JWT
    const token = makeJWT(
      user.id,
      expiresIn,
      config.jwt.secret
    );
    
    // Create a safe user object without the password
    const response = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: token,
    };
    
    // Return successful login response
    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
}