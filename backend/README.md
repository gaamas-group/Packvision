# Packager System Backend

## Overview
This is the FastAPI backend for the Packager System. It provides the API endpoints for the frontend application, handling authentication, data processing, and business logic.

## Code Flow
1.  **Entry Point**: `app/main.py` initializes the FastAPI application.
2.  **Routing**: The app includes routers from `app/api/v1/`. For example, authentication routes are defined in `app/api/v1/auth.py` and included in `main.py`.
3.  **Authentication**: The `auth.py` file contains the `/auth/login` endpoint which validates credentials and returns an access token (currently a stub returning a test token).

## Project Structure
- `app/main.py`: Application entry point and health check (`/health`).
- `app/api/v1/`: API route definitions (versions).
    - `auth.py`: Authentication endpoints.
    - `users.py`: User management endpoints.
    - `orders.py`: Order processing endpoints.
    - `videos.py`: Video handling endpoints.
- `app/core/`: Core configuration and security settings.
- `app/db/`: Database connection and session management.
- `app/schemas/`: Pydantic models for request/response validation.

## How to Run Locally

### Prerequisites
- Python 3.11+ installed.

### Steps
1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment** (recommended):
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the server**:
    ```bash
    uvicorn app.main:app --reload
    ```

5.  **Access the API**:
    - The server will start at `http://127.0.0.1:8000`.
    - Interactive API documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.
    - Health check: `http://127.0.0.1:8000/health`.
