#!/bin/bash
# Bash script to start PostgreSQL using Docker Compose
# This script starts only the PostgreSQL service

echo "Starting PostgreSQL container..."

# Navigate to infra directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INFRA_DIR="$SCRIPT_DIR/../../infra"

if [ ! -d "$INFRA_DIR" ]; then
    echo "Error: infra directory not found at $INFRA_DIR"
    exit 1
fi

cd "$INFRA_DIR"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker."
    exit 1
fi

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
ready=false

while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
    sleep 2
    attempt=$((attempt + 1))
    
    if docker exec packvision-postgres pg_isready -U postgres > /dev/null 2>&1; then
        ready=true
        echo "PostgreSQL is ready!"
    else
        echo -n "."
    fi
done

if [ "$ready" = false ]; then
    echo ""
    echo "Warning: PostgreSQL may not be fully ready yet."
    echo "You can check the status with: docker-compose ps"
else
    echo ""
    echo "PostgreSQL is running and ready to accept connections."
    echo "You can now run migrations with: npm run migrate"
fi

