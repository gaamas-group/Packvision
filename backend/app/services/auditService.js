import { query } from '../db/connection.js';

/**
 * Log an audit event to the database.
 * This function is fire-and-forget and handles its own errors to prevent
 * blocking the main application flow.
 *
 * @param {Object} params
 * @param {string} params.tenant_id - UUID of the tenant
 * @param {string} params.actor_id - UUID of the user performing the action
 * @param {string} params.action - Action constant from auditActions.js
 * @param {string} [params.entity_type] - Type of entity involved (e.g., 'recording', 'user')
 * @param {string} [params.entity_id] - UUID of the entity
 * @param {Object} [params.metadata] - Additional JSON metadata
 */
export const logAudit = async ({
  tenant_id,
  actor_id,
  action,
  entity_type = null,
  entity_id = null,
  metadata = {},
}) => {
  try {
    // Validate required fields
    if (!tenant_id || !actor_id || !action) {
      console.warn('Audit log missing required fields:', {
        tenant_id,
        actor_id,
        action,
      });
      return;
    }

    const sql = `
      INSERT INTO audit_logs (
        tenant_id,
        actor_id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    const values = [
      tenant_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata,
    ];

    await query(sql, values);
  } catch (error) {
    // Silent failure to avoid breaking the main flow
    // In a real production system, this might log to an error monitoring service
    console.error('Failed to write audit log:', error);
  }
};
