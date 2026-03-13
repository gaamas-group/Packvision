import express from 'express';
import prisma from '../../db/connection.js';
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

    const where = { tenantId: tenant_id };
    if (package_code) where.order = { packageCode: package_code };
    if (status) where.status = status;

    const [count, recordings] = await Promise.all([
      prisma.recording.count({ where }),
      prisma.recording.findMany({
        where,
        include: {
          order: { select: { packageCode: true } },
          user: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      })
    ]);

    const formattedRecordings = recordings.map(r => ({
      id: r.id,
      tenant_id: r.tenantId,
      order_id: r.orderId,
      user_id: r.userId,
      bucket: r.bucket,
      object_key: r.objectKey,
      file_size: r.fileSize ? Number(r.fileSize) : null,
      duration_seconds: r.durationSeconds,
      started_at: r.startedAt,
      ended_at: r.endedAt,
      status: r.status,
      created_at: r.createdAt,
      package_code: r.order.packageCode,
      packager_name: r.user.username,
    }));

    res.json({
      recordings: formattedRecordings,
      limit: parseInt(limit),
      offset: parseInt(offset),
      count,
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

    const [total_orders, total_recordings, total_returned] = await Promise.all([
      prisma.order.count({ where: { tenantId: tenant_id } }),
      prisma.recording.count({ where: { tenantId: tenant_id } }),
      prisma.recording.count({ where: { tenantId: tenant_id, status: 'returned' } })
    ]);

    res.json({ total_orders, total_recordings, total_returned });
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

    const packagers = await prisma.user.findMany({
      where: { tenantId: tenant_id, role: 'packager' },
      select: { id: true, username: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ packagers: packagers.map(p => ({
      id: p.id,
      username: p.username,
      created_at: p.createdAt
    }))});
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
    const existingUser = await prisma.user.findFirst({
      where: { username },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant_id,
        username,
        passwordHash: hashedPassword,
        role: 'packager'
      },
      select: { id: true, username: true, createdAt: true }
    });

    // Audit Log: ADMIN_ACTION (Create Packager)
    logAudit({
      tenant_id,
      actor_id: req.user.id,
      action: ADMIN_ACTION,
      entity_type: 'user',
      entity_id: user.id,
      metadata: {
        target_username: user.username,
        action_detail: 'create_packager',
      },
    });

    res.status(201).json({ packager: {
      id: user.id,
      username: user.username,
      created_at: user.createdAt
    }});
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
