import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function createRefreshToken(token: string, userId: string, expiresAt: Date) {
  const [result] = await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expiresAt,
      // revokedAt will be null by default
    })
    .returning();
  return result;
}

export async function revokeRefreshToken(token: string) {
  const now = new Date();
  
  const [result] = await db
    .update(refreshTokens)
    .set({
      revokedAt: now,
      updatedAt: now
    })
    .where(eq(refreshTokens.token, token))
    .returning();
    
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  // Get current time for expiration check
  const now = new Date();

  // Find the token and join with users table to get user info
  const results = await db
    .select({
      user: users,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
      and(
        eq(refreshTokens.token, token), // Match the token
        isNull(refreshTokens.revokedAt), // Token is not revoked
        gt(refreshTokens.expiresAt, now) // Token is not expired
      )
    )
    .limit(1);

  // Return the user if found, undefined otherwise
  return results[0]?.user;
}
