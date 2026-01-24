import express from "express";
import { authenticateUser, generateToken } from "../../core/auth.js";
import { loginRateLimiter } from "../../middleware/rateLimiter.js";
import logger from "../../core/logger.js";
import { loginValidation } from "./validations.js";
import { validate } from "../../middleware/validation.js";

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 */
router.post("/login", loginValidation, validate, loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    const access_token = generateToken(user);

    logger.info(`User ${username} logged in successfully`);

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
    logger.warn(`Failed login attempt for username: ${req.body.username}`);
    res.status(401).json({
      error: error.message || "Invalid credentials",
    });
  }
});

export default router;
