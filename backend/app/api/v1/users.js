import express from 'express';

// Create post, put API to save users in the database

const router = express.Router();

/**
 * GET /api/v1/users
 * Get all users (stub)
 */
router.get('/users', (req, res) => {
  res.json({ users: [] });
});

/**
 * GET /api/v1/users/:id
 * Get user by ID (stub)
 */
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, username: 'user' });
});

export default router;

