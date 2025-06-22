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