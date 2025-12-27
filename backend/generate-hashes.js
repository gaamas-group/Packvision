import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = {
    admin: 'admin123',
    scanner: 'scanner123',
    packer: 'packer123',
  };

  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role}: '${hash}',`);
  }
}

generateHashes();
