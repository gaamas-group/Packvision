# PowerShell script to start PostgreSQL using Docker Compose
# This script starts only the PostgreSQL service

Write-Host "Starting PostgreSQL container..." -ForegroundColor Green

# Navigate to infra directory
$infraPath = Join-Path $PSScriptRoot "..\..\infra"
if (-not (Test-Path $infraPath)) {
    Write-Host "Error: infra directory not found at $infraPath" -ForegroundColor Red
    exit 1
}

Set-Location $infraPath

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL service
Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $result = docker exec packvision-postgres pg_isready -U postgres 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            Write-Host "PostgreSQL is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline
    }
}

if (-not $ready) {
    Write-Host "`nWarning: PostgreSQL may not be fully ready yet." -ForegroundColor Yellow
    Write-Host "You can check the status with: docker-compose ps" -ForegroundColor Yellow
} else {
    Write-Host "`nPostgreSQL is running and ready to accept connections." -ForegroundColor Green
    Write-Host "You can now run migrations with: npm run migrate" -ForegroundColor Cyan
}

