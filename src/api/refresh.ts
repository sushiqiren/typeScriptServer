import type { Request, Response, NextFunction } from "express";
import { getUserFromRefreshToken } from "../db/queries/refreshTokens.js";
import { getBearerToken, makeJWT } from "../utils/auth.js";
import { UnauthorizedError } from "./ApiError.js";
import { config } from "../config.js";

export async function handlerRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract refresh token from Authorization header
    let refreshToken: string;
    try {
      refreshToken = getBearerToken(req);
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    
    // Look up the user associated with this refresh token
    const user = await getUserFromRefreshToken(refreshToken);
    
    // If no valid user found for this token
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    
    // Generate a new access token
    const ONE_HOUR = 60 * 60;  // 3600 seconds
    const newToken = makeJWT(
      user.id,
      ONE_HOUR,
      config.jwt.secret
    );
    
    // Return the new access token
    res.status(200).json({
      token: newToken
    });
    
  } catch (error) {
    next(error);
  }
}