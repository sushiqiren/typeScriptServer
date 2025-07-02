import type { Request, Response, NextFunction } from "express";
import { upgradeToChirpyRed } from "../db/queries/users.js";
import { NotFoundError } from "./ApiError.js";

interface WebhookEvent {
  event: string;
  data: {
    userId: string;
  };
}

export async function handlerPolkaWebhook(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const webhookData = req.body as WebhookEvent;
    
    // Only process user.upgraded events
    if (webhookData.event !== "user.upgraded") {
      // Ignore all other events with a 204 No Content response
      return res.status(204).end();
    }
    
    // Extract the user ID from the webhook payload
    const { userId } = webhookData.data;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in webhook data" });
    }
    
    // Upgrade the user to Chirpy Red
    const updatedUser = await upgradeToChirpyRed(userId);
    
    // If user doesn't exist, return 404
    if (!updatedUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    
    // Return 204 No Content for successful upgrade
    return res.status(204).end();
    
  } catch (error) {
    next(error);
  }
}