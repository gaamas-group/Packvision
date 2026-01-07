-- Create tenants table for multi-tenant support
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on tenant name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);

