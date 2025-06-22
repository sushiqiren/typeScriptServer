import type { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash } from "../utils/auth.js";
import { UnauthorizedError } from "./ApiError.js";
import { users } from "../db/schema.js";

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
    
    // Create a safe user object without the password
    const safeUserData: UserResponse = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Return successful login response
    res.status(200).json(safeUserData);
    
  } catch (error) {
    next(error);
  }
}