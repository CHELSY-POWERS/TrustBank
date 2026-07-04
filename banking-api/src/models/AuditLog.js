const { pool } = require('../config/database');

/**
 * AuditLog model.
 * Records sensitive/admin actions for traceability - a standard
 * requirement in banking-style systems.
 */
class AuditLog {
  static async create({ actorUserId, action, targetType, targetId, details, ipAddress }) {
    await pool.query(
      `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [actorUserId || null, action, targetType || null, targetId || null, JSON.stringify(details || {}), ipAddress || null]
    );
  }

  static async findAll({ limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT al.*, u.email AS actor_email FROM audit_logs al
       LEFT JOIN users u ON al.actor_user_id = u.id
       ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }
}

module.exports = AuditLog;
