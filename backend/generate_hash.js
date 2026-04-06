import bcrypt from 'bcrypt';

const password = process.argv[2];
const BCRYPT_ROUNDS = 12;

if (!password) {
  console.error('Please provide a password as an argument');
  console.error('Usage: node generate_hash.js <password>');
  process.exit(1);
}

(async () => {
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
})();
