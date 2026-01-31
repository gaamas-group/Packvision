import express from 'express';
import { authenticateUser, generateToken } from '../../core/auth.js';
import { logAudit } from '../../services/auditService.js';
import { LOGIN } from '../../constants/auditActions.js';

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    const user = await authenticateUser(username, password);
    const access_token = generateToken(user);

    // Audit Log: LOGIN
    logAudit({
      tenant_id: user.tenant_id,
      actor_id: user.id,
      action: LOGIN,
      entity_type: 'user',
      entity_id: user.id,
    });

    res.json({
      access_token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Invalid credentials',
    });
  }
});

export default router;
