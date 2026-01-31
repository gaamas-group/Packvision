import express from 'express';
import { query } from '../../db/connection.js';
import { authenticate, authorize, hashPassword } from '../../core/auth.js';
import { logAudit } from '../../services/auditService.js';
import { ADMIN_ACTION } from '../../constants/auditActions.js';

const router = express.Router();

// Admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * GET /api/v1/admin/recordings
 * Fetch all recordings for the authenticated admin's tenant
 */
router.get('/recordings', async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { package_code, status, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT 
        r.id,
        r.tenant_id,
        r.order_id,
        r.user_id,
        r.bucket,
        r.object_key,
        r.file_size,
        r.duration_seconds,
        r.started_at,
        r.ended_at,
        r.status,
        r.created_at,
        o.package_code,
        u.username as packager_name
      FROM recordings r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      WHERE r.tenant_id = $1
    `;

    const params = [tenant_id];
    let paramIndex = 2;

    if (package_code) {
      sql += ` AND o.package_code = $${paramIndex}`;
      params.push(package_code);
      paramIndex++;
    }

    if (status) {
      sql += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json({
      recordings: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching admin recordings:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

/**
 * GET /api/v1/admin/stats
 * Fetch dashboard statistics for the authenticated admin's tenant
 */
router.get('/stats', async (req, res) => {
  try {
    const { tenant_id } = req.user;

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE tenant_id = $1) as total_orders,
        (SELECT COUNT(*) FROM recordings WHERE tenant_id = $1) as total_recordings,
        (SELECT COUNT(*) FROM recordings WHERE tenant_id = $1 AND status = 'returned') as total_returned
    `;

    const result = await query(statsQuery, [tenant_id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/v1/admin/packagers
 * fetch all packagers for the authenticated admin's tenant
 */
router.get('/packagers', async (req, res) => {
  try {
    const { tenant_id } = req.user;

    const sql = `
      SELECT 
        id, 
        username,
        created_at
      FROM users 
      WHERE tenant_id = $1 
      AND role = 'packager'
      ORDER BY created_at DESC
    `;

    const result = await query(sql, [tenant_id]);
    res.json({ packagers: result.rows });
  } catch (error) {
    console.error('Error fetching packagers:', error);
    res.status(500).json({ error: 'Failed to fetch packagers' });
  }
});

/**
 * POST /api/v1/admin/packagers
 * Create a new packager
 */
router.post('/packagers', async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      "INSERT INTO users (tenant_id, username, password_hash, role) VALUES ($1, $2, $3, 'packager') RETURNING id, username, created_at",
      [tenant_id, username, hashedPassword],
    );

    // Audit Log: ADMIN_ACTION (Create Packager)
    logAudit({
      tenant_id,
      actor_id: req.user.id,
      action: ADMIN_ACTION,
      entity_type: 'user',
      entity_id: result.rows[0].id,
      metadata: {
        target_username: result.rows[0].username,
        action_detail: 'create_packager',
      },
    });

    res.status(201).json({ packager: result.rows[0] });
  } catch (error) {
    console.error('Error creating packager:', error);
    res.status(500).json({
      error: 'Failed to create packager',
      details: error.message,
      code: error.code, // for SQL errors
    });
  }
});

export default router;
