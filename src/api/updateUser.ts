import type { Request, Response, NextFunction } from "express";
import { updateUser } from "../db/queries/users.js";
import { getBearerToken, validateJWT, hashPassword } from "../utils/auth.js";
import { BadRequestError, UnauthorizedError } from "./ApiError.js";
import { config } from "../config.js";
import { users } from "../db/schema.js";

// Define the full user type from the schema
type User = typeof users.$inferSelect;

// Create a safe response type that excludes the hashedPassword
type UserResponse = Omit<User, 'hashedPassword'>;

interface UpdateUserRequest {
  email?: string;
  password?: string;
}

export async function handlerUpdateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract and validate JWT from the request
    let userId: string;
    try {
      const token = getBearerToken(req);
      userId = validateJWT(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError("Authentication required to update user");
    }
    
    const data = req.body as UpdateUserRequest;
    
    // Check if anything is being updated
    if (data.email === undefined && data.password === undefined) {
      throw new BadRequestError("No update fields provided");
    }
    
    // Validate email if provided
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        throw new BadRequestError("Email must be a string");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestError("Invalid email format");
      }
    }
    
    // Validate password if provided
    let hashedPassword: string | undefined = undefined;
    if (data.password !== undefined) {
      if (typeof data.password !== 'string') {
        throw new BadRequestError("Password must be a string");
      }
      
      if (data.password.length < 5) {
        throw new BadRequestError("Password must be at least 5 characters long");
      }
      
      // Hash the new password
      hashedPassword = await hashPassword(data.password);
    }
    
    // Update the user in the database
    const updatedUser = await updateUser(userId, {
      email: data.email,
      hashedPassword
    });
    
    if (!updatedUser) {
      throw new BadRequestError("User update failed");
    }
    
    // Return the updated user data without the password hash
    const safeUserData: UserResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      isChirpyRed: updatedUser.isChirpyRed
    };
    
    res.status(200).json(safeUserData);
    
  } catch (error) {
    next(error);
  }
}