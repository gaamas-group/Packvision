import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from '../connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and execute migration files in order
const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Read migration files
    const createTenantsTable = readFileSync(
      join(__dirname, '001_create_tenants_table.sql'),
      'utf-8'
    );
    
    const createUsersTable = readFileSync(
      join(__dirname, '002_create_users_table.sql'),
      'utf-8'
    );
    
    // Execute migrations in order
    console.log('Running migration: 001_create_tenants_table.sql');
    await query(createTenantsTable);
    
    console.log('Running migration: 002_create_users_table.sql');
    await query(createUsersTable);
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
// Check if this is the main module
if (process.argv[1] && process.argv[1].includes('runMigrations.js')) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrations;

