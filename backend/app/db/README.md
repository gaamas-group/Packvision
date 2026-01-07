# Database Setup

This directory contains the database configuration and migrations for the Packvision backend.

## Database Schema

### Tenants Table
- `id` (SERIAL PRIMARY KEY) - Unique tenant identifier
- `name` (VARCHAR(255)) - Tenant name (unique)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Users Table
- `id` (SERIAL PRIMARY KEY) - Unique user identifier
- `first_name` (VARCHAR(255)) - User's first name
- `last_name` (VARCHAR(255)) - User's last name
- `username` (VARCHAR(255)) - Unique username
- `password` (VARCHAR(255)) - Hashed password
- `role` (VARCHAR(50)) - User role: 'admin' or 'packager'
- `tenant_id` (INTEGER) - Foreign key to tenants table
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

### Option 1: Supabase (Recommended for Production)

```env
# Supabase Connection String (get from Supabase Dashboard → Settings → Database)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Option 2: Local PostgreSQL

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=packvision
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

**Note**: If using Supabase, you only need `DATABASE_URL`. The individual connection parameters are for local development.

## Running Migrations

To create the database tables, run:

```bash
npm run migrate
```

Or manually:

```bash
node app/db/migrations/runMigrations.js
```

## Database Connection

The database connection is configured in `connection.js` and uses a connection pool for efficient database access.

## Usage Example

```javascript
import { query } from './app/db/connection.js';

// Example query
const result = await query('SELECT * FROM users WHERE tenant_id = $1', [tenantId]);
console.log(result.rows);
```

