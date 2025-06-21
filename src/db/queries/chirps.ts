import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getAllChirps() {
  // Get all chirps ordered by createdAt in ascending order
  return await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
}

// get a chirp by ID
export async function getChirpById(id: string) {
  const results = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id))
    .limit(1);
  
  return results[0]; // Return undefined if not found
}

export async function deleteAllChirps() {
  return await db.delete(chirps);
}