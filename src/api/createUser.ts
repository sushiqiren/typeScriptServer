import type { Request, Response, NextFunction } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./ApiError.js";

interface CreateUserRequest {
  email: string;
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
    
    // Create the user using the existing query function
    const newUser = await createUser({ email: data.email });
    
    if (!newUser) {
      throw new BadRequestError("Email already exists");
    }
    
    // Return the user data with a 201 Created status
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    });
    
  } catch (error) {
    next(error);
  }
}