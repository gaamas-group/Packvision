import express from "express";
import { authenticateUser, generateToken } from "../../core/auth.js";

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 */
router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await authenticateUser(username, password);
    const access_token = generateToken(user);

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
    console.error("Login error:", error);
    res.status(401).json({
      error: error.message || "Invalid credentials",
    });
  }
});

export default router;
