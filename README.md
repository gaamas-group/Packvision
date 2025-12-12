# Packager System Monorepo

## Structure

- **backend/**: FastAPI application
- **frontend/**: React + Vite application (Role-based: Admin & Packager)
- **infra/**: Docker and Terraform configuration

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js
- Python 3.11+

### Running with Docker

```bash
cd infra
docker-compose up --build
```

### Manual Setup

See `backend/README.md` and `frontend/README.md` for details.
