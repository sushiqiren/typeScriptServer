import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

export async function hashPassword(password: string): Promise<string> {
  // Generate a salt with cost factor 12
  // Higher cost factor = more secure but slower
  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  
  // Hash the password with the generated salt
  const hash = await bcrypt.hash(password, salt);
  
  return hash;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  // Compare the provided password with the stored hash
  // This function handles all the secure comparison logic
  return await bcrypt.compare(password, hash);
}

/**
 * Creates a JSON Web Token for authentication
 * @param userID The user's unique identifier 
 * @param expiresIn Number of seconds until token expiration
 * @param secret Secret key to sign the token
 * @returns A signed JWT string
 */
export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  // Define the payload type with required JWT fields
  type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
  
  // Get current time in seconds
  const issuedAt = Math.floor(Date.now() / 1000);
  
  // Create the JWT payload
  const payload: payload = {
    iss: "chirpy",              // Issuer of the token
    sub: userID,                // Subject (user ID)
    iat: issuedAt,              // Issued at (current time)
    exp: issuedAt + expiresIn   // Expiration time
  };
  
  // Sign and return the token
  return jwt.sign(payload, secret);
}

/**
 * Validates a JSON Web Token and extracts the user ID
 * @param tokenString The JWT string to validate
 * @param secret Secret key used to verify the token signature
 * @returns The user ID extracted from the token
 * @throws Error if the token is invalid, expired, or malformed
 */
export function validateJWT(tokenString: string, secret: string): string {
  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(tokenString, secret) as jwt.JwtPayload;
    
    // Check if the token has a subject field (user ID)
    if (!decoded.sub) {
      throw new Error("Invalid token: missing user ID");
    }
    
    // Return the user ID from the subject field
    return decoded.sub as string;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      } else if (error instanceof jwt.NotBeforeError) {
        throw new Error("Token not yet valid");
      } else {
        throw new Error("Invalid token signature");
      }
    }
    
    // Re-throw any other errors
    throw error;
  }
}