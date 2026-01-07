import { query } from '../app/db/connection.js';

async function checkSchema() {
  try {
    console.log('Checking users table structure...\n');
    
    // Get column information
    const columns = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('Users table columns:');
    console.table(columns.rows);
    
    // Get table constraints
    const constraints = await query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users';
    `);
    
    console.log('\nUsers table constraints:');
    console.table(constraints.rows);
    
    // Check tenants table too
    console.log('\n\nChecking tenants table structure...\n');
    const tenantColumns = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position;
    `);
    
    console.log('Tenants table columns:');
    console.table(tenantColumns.rows);
    
    // Try to get a sample row to see actual data
    console.log('\n\nSample data from users table (if any):');
    const sample = await query('SELECT * FROM users LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('Sample row:', sample.rows[0]);
    } else {
      console.log('No data in users table yet');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();

