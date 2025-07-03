import type { Request, Response, NextFunction } from "express";
import { upgradeToChirpyRed } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./ApiError.js";
import { getAPIKey } from "../utils/auth.js";
import { config } from "../config.js";

interface WebhookEvent {
  event: string;
  data: {
    userId: string;
  };
}

export async function handlerPolkaWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Verify the API key before processing the webhook
    try {
      const apiKey = getAPIKey(req);
      
      // Check if the provided API key matches the one in config
      if (apiKey !== config.polka.key) {
        throw new UnauthorizedError("Invalid API key");
      }
    } catch (error) {
      // Return 401 for any authentication error
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    const webhookData = req.body as WebhookEvent;
    
    // Only process user.upgraded events
    if (webhookData.event !== "user.upgraded") {
      // Ignore all other events with a 204 No Content response
      res.status(204).end();
      return;
    }
    
    // Extract the user ID from the webhook payload
    const { userId } = webhookData.data;
    
    if (!userId) {
      res.status(400).json({ error: "Missing userId in webhook data" });
      return;
    }
    
    // Upgrade the user to Chirpy Red
    const updatedUser = await upgradeToChirpyRed(userId);
    
    // If user doesn't exist, return 404
    if (!updatedUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    
    // Return 204 No Content for successful upgrade
    res.status(204).end();
    
  } catch (error) {
    next(error);
  }
}