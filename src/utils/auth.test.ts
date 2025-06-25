import { describe, it, expect, beforeAll, vi } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
  
  it("should generate different hashes for the same password", async () => {
    const anotherHash = await hashPassword(password1);
    expect(anotherHash).not.toBe(hash1);
  });
  
  it("should still validate when hashes are different for the same password", async () => {
    const anotherHash = await hashPassword(password1);
    const result = await checkPasswordHash(password1, anotherHash);
    expect(result).toBe(true);
  });
});

describe("JWT Generation and Validation", () => {
  const userId = "user-123";
  const validSecret = "valid-secret-key";
  const wrongSecret = "wrong-secret-key";
  const expiresIn = 3600; // 1 hour in seconds
  
  let validToken: string;
  
  beforeAll(() => {
    validToken = makeJWT(userId, expiresIn, validSecret);
  });
  
  it("should generate a JWT string", () => {
    expect(typeof validToken).toBe("string");
    expect(validToken.split(".").length).toBe(3); // JWTs have 3 parts separated by dots
  });
  
  it("should validate a correctly signed token", () => {
    const extractedUserId = validateJWT(validToken, validSecret);
    expect(extractedUserId).toBe(userId);
  });
  
  it("should reject tokens signed with wrong secret", () => {
    expect(() => {
      validateJWT(validToken, wrongSecret);
    }).toThrow();
  });
  
  it("should reject expired tokens", () => {
    // Mock date to be in the future
    const realDateNow = Date.now;
    Date.now = vi.fn(() => realDateNow() + (expiresIn * 1000) + 1000); // Add expiresIn seconds + 1 second
    
    expect(() => {
      validateJWT(validToken, validSecret);
    }).toThrow("expired");
    
    // Restore original Date.now
    Date.now = realDateNow;
  });
  
  it("should reject malformed tokens", () => {
    const malformedToken = "not.a.validtoken";
    expect(() => {
      validateJWT(malformedToken, validSecret);
    }).toThrow();
  });
  
  it("should generate tokens with correct payload structure", () => {
    const token = makeJWT(userId, expiresIn, validSecret);
    
    // Split the token and decode the payload (middle part)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    expect(payload.sub).toBe(userId);
    expect(payload.iss).toBe("chirpy");
    expect(typeof payload.iat).toBe("number");
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp - payload.iat).toBe(expiresIn);
  });
});