import type { Request, Response, NextFunction } from "express";
import { revokeRefreshToken } from "../db/queries/refreshTokens.js";
import { getBearerToken } from "../utils/auth.js";
import { UnauthorizedError } from "./ApiError.js";

export async function handlerRevokeToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract refresh token from Authorization header
    let refreshToken: string;
    try {
      refreshToken = getBearerToken(req);
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
    
    // Revoke the token in the database
    await revokeRefreshToken(refreshToken);
    
    // Return 204 No Content for successful revocation
    // No response body is sent with a 204 response
    res.status(204).end();
    
  } catch (error) {
    next(error);
  }
}