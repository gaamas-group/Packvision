import express from 'express';
import { query } from '../../db/connection.js';
import { authenticate, authorize } from '../../core/auth.js';

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

export default router;
