# Packager System Backend

## Overview
This is the Node.js/Express backend for the Packager System. It provides the API endpoints for the frontend application, handling authentication, data processing, and S3 presigned URL generation for file uploads/downloads.

## Code Flow
1.  **Entry Point**: `server.js` initializes the Express application.
2.  **Routing**: The app includes routers from `app/api/v1/`. For example, authentication routes are defined in `app/api/v1/auth.js` and included in `server.js`.
3.  **S3 Service**: The `app/services/s3Service.js` provides functions to generate presigned URLs for uploading and downloading files from S3.
4.  **Authentication**: The `auth.js` file contains the `/auth/login` endpoint which validates credentials and returns an access token (currently a stub returning a test token).

## Project Structure
- `server.js`: Application entry point and health check (`/health`).
- `app/api/v1/`: API route definitions (versions).
    - `auth.js`: Authentication endpoints.
    - `users.js`: User management endpoints.
    - `orders.js`: Order processing endpoints with S3 presigned URL generation.
    - `videos.js`: Video handling endpoints with S3 presigned URL generation.
- `app/services/`: Service layer.
    - `s3Service.js`: S3 presigned URL generation service.

## API Endpoints

### Videos
- `POST /api/v1/videos/upload-url` - Generate presigned URL for video upload
- `GET /api/v1/videos/download-url/:key` - Generate presigned URL for video download

### Orders
- `POST /api/v1/orders/:orderId/documents/upload-url` - Generate presigned URL for order document upload
- `GET /api/v1/orders/:orderId/documents/download-url/:key` - Generate presigned URL for order document download
- `GET /api/v1/orders` - Get all orders (stub)
- `GET /api/v1/orders/:id` - Get order by ID (stub)

### Users
- `GET /api/v1/users` - Get all users (stub)
- `GET /api/v1/users/:id` - Get user by ID (stub)

### Auth
- `POST /api/v1/auth/login` - Login endpoint (stub)

## How to Run Locally

### Prerequisites
- Node.js 20.19+ or 22.12+ installed.

### Steps
1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables** (create a `.env` file in the backend directory):
    ```bash
    # AWS Configuration
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=your-access-key-id
    AWS_SECRET_ACCESS_KEY=your-secret-access-key
    AWS_S3_BUCKET_NAME=packvision-bucket

    # Server Configuration
    PORT=8000
    NODE_ENV=development

    # Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:5173
    ```

4.  **Run the server**:
    ```bash
    npm start
    # or for development with auto-reload:
    npm run dev
    ```

5.  **Access the API**:
    - The server will start at `http://127.0.0.1:8000`.
    - Health check: `http://127.0.0.1:8000/health`.
