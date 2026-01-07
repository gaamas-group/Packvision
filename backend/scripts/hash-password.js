/**
 * Utility script to hash a password using bcrypt with cost factor 12
 * 
 * Usage:
 *   node scripts/hash-password.js <password>
 * 
 * Example:
 *   node scripts/hash-password.js mypassword123
 */

import { hashPassword } from '../app/core/auth.js';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

try {
  const hashedPassword = await hashPassword(password);
  console.log('\n✅ Password hashed successfully!');
  console.log('\nHashed password:');
  console.log(hashedPassword);
  console.log('\nUse this value in your database password_hash column.\n');
} catch (error) {
  console.error('Error hashing password:', error.message);
  process.exit(1);
}

