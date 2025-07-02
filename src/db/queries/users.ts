import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import {eq} from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(
      {
        email: user.email,
        hashedPassword: user.hashedPassword,
      }
    )
    .onConflictDoNothing()
    .returning();
  return result;
}

// add a new function to find a user by email
export async function getUserByEmail(email: string) {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return results[0]; // Returns undefined if user not found
}

export async function deleteAllUsers() {
  return await db.delete(users);
}

export async function updateUser(userId: string, updates: { email?: string; hashedPassword?: string }) {
  // Create an object with only the fields that need to be updated
  const updateData: { email?: string; hashedPassword?: string } = {};
  
  if (updates.email !== undefined) {
    updateData.email = updates.email;
  }
  
  if (updates.hashedPassword !== undefined) {
    updateData.hashedPassword = updates.hashedPassword;
  }
  
  // Only proceed if there's something to update
  if (Object.keys(updateData).length === 0) {
    // No fields to update, fetch the current user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return result[0];
  }
  
  // Update the user and return the updated record
  const [result] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();
    
  return result;
}

/**
 * Upgrades a user to Chirpy Red status
 * @param userId ID of the user to upgrade
 * @returns The updated user record or undefined if user not found
 */
export async function upgradeToChirpyRed(userId: string) {
  const [result] = await db
    .update(users)
    .set({
      isChirpyRed: true,
      updatedAt: new Date() // Ensure updatedAt is refreshed
    })
    .where(eq(users.id, userId))
    .returning();
    
  return result;
}

