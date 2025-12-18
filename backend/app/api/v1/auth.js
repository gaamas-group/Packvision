import express from 'express';

// Compare the username and password with the database to return the role

const router = express.Router();

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Stub implementation
  res.json({
    access_token: 'test',
    role: 'admin',
  });
});

export default router;

