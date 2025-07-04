import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq, desc } from "drizzle-orm";

// Define a specific type for the forbidden result
interface ForbiddenResult {
  forbidden: true;
}

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getAllChirps(authorId?: string) {
  // Start with the select query
  const selectQuery = db.select({
    id: chirps.id,
    body: chirps.body,
    createdAt: chirps.createdAt,
    updatedAt: chirps.updatedAt,
    userId: chirps.userId,
  }).from(chirps);
    
  // Apply filter based on authorId condition
  if (authorId) {
    return await selectQuery
      .where(eq(chirps.userId, authorId))
      .orderBy(desc(chirps.createdAt));
  } else {
    return await selectQuery
      .orderBy(desc(chirps.createdAt));
  }
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

export async function deleteChirp(chirpId: string, userId: string) {
  // Find the chirp first to check ownership
  const chirp = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId))
    .limit(1);

  // If chirp doesn't exist, return null
  if (chirp.length === 0) {
    return null;
  }

  // Check if the user is the author
  if (chirp[0].userId !== userId) {
    return { forbidden: true } as ForbiddenResult;
  }

  // Delete the chirp
  const [deleted] = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();

  return deleted;
}