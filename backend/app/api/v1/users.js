import express from "express";
import prisma from "../../db/connection.js";
import { authenticate } from "../../core/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get("/users", async (req, res) => {
  try {
    const { role, tenant_id } = req.query;

    const where = {};
    if (role) where.role = role;
    if (tenant_id) where.tenantId = tenant_id;

    const users = await prisma.user.findMany({
      where,
      include: {
        tenant: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      tenant_id: u.tenantId,
      tenant_name: u.tenant?.name,
      created_at: u.createdAt,
    }));

    res.json({ users: formattedUsers });
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id: userId, username, role: userRole } = user;
    res.json({ id: userId, username, role: userRole });
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
