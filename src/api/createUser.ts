import type { Request, Response, NextFunction } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../utils/auth.js";
import { BadRequestError } from "./ApiError.js";
import {users} from "../db/schema.js";

// Define the full user type from the schema
type User = typeof users.$inferSelect;

// Create a safe response type that excludes the hashed password
type UserResponse = Omit<User, 'hashedPassword'>;


interface CreateUserRequest {
  email: string;
  password: string;
}

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateUserRequest;
    
    // Validate email
    if (!data.email || typeof data.email !== 'string') {
      throw new BadRequestError("Email is required and must be a string");
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new BadRequestError("Invalid email format");
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new BadRequestError("Password is required and must be a string");
    }

    // Enforce password strength requirements
    if (data.password.length < 5) {
      throw new BadRequestError("Password must be at least 5 characters long");
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password);
    
    // Create the user using the existing query function
    const newUser = await createUser({ 
      email: data.email,
      hashedPassword: hashedPassword 
    });
    
    if (!newUser) {
      throw new BadRequestError("Email already exists");
    }
    
    // Return the user data with a 201 Created status
    const safeUserData: UserResponse = {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    res.status(201).json(safeUserData);
  } catch (error) {
    next(error);
  }
}