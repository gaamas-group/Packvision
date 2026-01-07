import express from "express";
import { query } from "../../db/connection.js";
import { authenticate } from "../../core/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get("/users", async (req, res) => {
  try {
    const { role, tenant_id } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.username,
        u.role,
        u.tenant_id,
        t.name as tenant_name,
        u.created_at
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (tenant_id) {
      sql += ` AND u.tenant_id = $${paramIndex}`;
      params.push(tenant_id);
      paramIndex++;
    }

    sql += " ORDER BY u.created_at DESC";

    const result = await query(sql, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /api/v1/users/:id/role
 * Get user role by user ID
 * Requires authentication
 */
router.get("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own role, or admins can view any role
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden: You can only view your own role' 
      });
    }

    const result = await query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id: userId, username, role } = result.rows[0];
    res.json({ id: userId, username, role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ error: "Failed to fetch user role" });
  }
});

/**
 * GET /api/v1/users/me
 * Get current authenticated user's information
 */
router.get("/users/me", async (req, res) => {
  try {
    res.json({ 
      user: req.user 
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

export default router;
