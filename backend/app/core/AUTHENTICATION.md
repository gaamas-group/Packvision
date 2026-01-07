# Authentication Guide

## Overview

All API endpoints (except login) now require JWT token authentication. The authentication system uses JSON Web Tokens (JWT) to secure API requests.

## How It Works

1. **Login**: User provides username/password → Server returns JWT token
2. **API Requests**: Client sends JWT token in `Authorization` header → Server verifies token → Grants access

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `jsonwebtoken` - For JWT token generation and verification
- `bcrypt` - For password hashing (optional, supports plain text for now)

### 2. Environment Variables

Make sure your `.env` file includes:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

## API Usage

### Login Endpoint

**POST** `/api/v1/auth/login`

Request:
```json
{
  "username": "sidak_admin",
  "password": "sidak@123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "user": {
    "id": "4b869d00-e4ad-4b10-94a7-2361fc1930a4",
    "username": "sidak_admin",
    "name": "Sidak Taneja",
    "role": "admin",
    "tenant_id": "d8ccc064-0cca-4afa-801d-de8631ae73ff"
  }
}
```

### Protected Endpoints

All `/api/v1/users/*` endpoints now require authentication.

**Request Header:**
```
Authorization: Bearer <access_token>
```

Or:
```
Authorization: <access_token>
```

### Example: Get All Users

```bash
curl -X GET http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Example: Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Example: Get User Role

```bash
curl -X GET http://localhost:8000/api/v1/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration

### Storing Token

After login, store the token:

```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
```

### Using Token in Requests

```javascript
const token = localStorage.getItem('access_token');

const response = await fetch('/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Security Features

1. **Token Expiration**: Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
2. **User Verification**: Token is verified against database on each request
3. **Role-Based Access**: Users can only view their own data (unless admin)
4. **Password Security**: Supports bcrypt hashed passwords (with fallback for plain text)

## Middleware

### `authenticate`
- Verifies JWT token
- Attaches user info to `req.user`
- Returns 401 if token is invalid/missing

### `authorize(...roles)`
- Checks if user has required role
- Use after `authenticate`
- Returns 403 if user lacks permission

### Example: Admin-Only Route

```javascript
router.get('/admin/users', authenticate, authorize('admin'), async (req, res) => {
  // Only admins can access this
});
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient permissions",
  "required": ["admin"],
  "current": "packager"
}
```

## Notes

- Passwords in your database are currently stored as plain text. Consider hashing them with bcrypt for production.
- The `authenticate` middleware checks the database on each request to ensure the user still exists.
- Tokens include: `id`, `username`, `role`, `tenant_id`

