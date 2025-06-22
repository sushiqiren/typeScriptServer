import bcrypt from 'bcrypt';

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