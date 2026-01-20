import { query } from '../db/connection.js';

/**
 * Tenant Validation Middleware
 * Ensures the user belongs to a valid tenant in the database.
 * Must be used AFTER authentication middleware.
 */
export const validateTenant = async (req, res, next) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user || !req.user.tenant_id) {
      return res.status(401).json({ error: 'Tenant context missing' });
    }

    const tenantId = req.user.tenant_id;

    // 2. Query database to validate tenant existence
    const result = await query('SELECT id FROM tenants WHERE id = $1', [
      tenantId,
    ]);

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid tenant access' });
    }

    // Tenant is valid, proceed
    next();
  } catch (error) {
    console.error('Tenant validation error:', error);
    res.status(500).json({ error: 'Tenant validation failed' });
  }
};
