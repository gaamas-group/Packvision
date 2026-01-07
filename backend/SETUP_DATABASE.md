# Database Setup Guide

You need PostgreSQL running to use the database. Here are your options:

## Option 1: Docker Desktop (Recommended for Development)

### Install Docker Desktop
1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Wait for Docker to fully start (whale icon in system tray should be steady)

### Start PostgreSQL with Docker
```powershell
# Navigate to infra directory
cd infra

# Start PostgreSQL service
docker compose up -d postgres

# Check if it's running
docker compose ps

# View logs if needed
docker compose logs postgres
```

### Verify Connection
```powershell
# Test connection (if psql is available)
psql -h localhost -U postgres -d packvision
# Password: postgres
```

---

## Option 2: Install PostgreSQL Locally

### Download and Install
1. Download PostgreSQL for Windows: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for `postgres` user (remember this!)
   - Default port: 5432
   - Default service name: postgresql-x64-XX

### Start PostgreSQL Service
```powershell
# Start the PostgreSQL service
Start-Service postgresql-x64-15  # Replace 15 with your version number

# Or use Services GUI:
# Win+R → services.msc → Find PostgreSQL → Start
```

### Create Database
```powershell
# Connect to PostgreSQL (if psql is in PATH)
psql -U postgres

# Then run:
CREATE DATABASE packvision;
\q
```

### Update .env File
If you set a different password during installation, update `backend/.env`:
```env
DB_PASSWORD=your_actual_password
```

---

## Option 3: Supabase (Recommended for Production)

Supabase provides a managed PostgreSQL database with a free tier. This is the recommended option for production deployments.

### Setup Steps

1. **Create a Supabase Project**:
   - Go to https://supabase.com
   - Sign up or log in
   - Create a new project
   - Wait for the project to be provisioned (takes a few minutes)

2. **Get Your Connection String**:
   - In your Supabase project dashboard, go to **Settings** → **Database**
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`)

3. **Update Your `.env` File**:
   Create or update `backend/.env` with:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```
   
   **Important**: Replace `[YOUR-PASSWORD]` with your actual database password (shown when you create the project, or reset it in Settings → Database)

4. **Run Migrations**:
   ```powershell
   cd backend
   npm run migrate
   ```

### Alternative: Other Cloud PostgreSQL Services

You can also use:
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Azure Database**: https://azure.microsoft.com/en-us/products/postgresql
- **Google Cloud SQL**: https://cloud.google.com/sql/docs/postgres
- **Neon**: https://neon.tech

For these services, use individual connection parameters in your `.env`:
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SSL=true
```

---

## After PostgreSQL is Running

Once PostgreSQL is accessible, run the migrations:

```powershell
cd backend
npm run migrate
```

You should see:
```
Starting database migrations...
Running migration: 001_create_tenants_table.sql
Running migration: 002_create_users_table.sql
All migrations completed successfully!
Migrations completed
```

---

## Troubleshooting

### Connection Refused Error
- Make sure PostgreSQL is running
- Check if port 5432 is not blocked by firewall
- Verify credentials in `.env` file match your PostgreSQL setup

### Docker Not Found
- Install Docker Desktop from https://www.docker.com/products/docker-desktop/
- Make sure Docker Desktop is running before using docker commands

### Port Already in Use
If port 5432 is already in use:
1. Find what's using it: `netstat -ano | findstr :5432`
2. Either stop that service or change the port in `.env` and docker-compose.yml

### Check PostgreSQL Status
```powershell
# For Docker
docker compose ps

# For local installation
Get-Service -Name "*postgres*"
```



