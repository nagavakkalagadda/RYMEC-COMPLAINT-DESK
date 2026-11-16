const db = require('../config/db');

/**
 * Extracts client IP and Vercel edge geolocation headers from incoming request
 */
function extractClientContext(req) {
  if (!req) return { ip: '127.0.0.1', location: 'Ballari, KA (Campus Internal)' };
  
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || req.ip || '127.0.0.1');

  // Vercel Edge Geolocation Headers
  const city = req.headers['x-vercel-ip-city'];
  const region = req.headers['x-vercel-ip-country-region'];
  const country = req.headers['x-vercel-ip-country'];

  let location = 'Ballari, KA (RYMEC Campus)';
  if (city && country) {
    location = `${decodeURIComponent(city)}, ${region || ''} (${country})`.trim();
  } else if (req.headers['host']?.includes('localhost')) {
    location = 'Ballari, KA (RYMEC LAN)';
  }
  return { ip, location };
}

/**
 * Records an immutable forensic audit log with geographic location and IP telemetry
 */
async function recordAuditLog(req, userId, action, entityType, entityId, details = {}) {
  try {
    const { ip, location } = extractClientContext(req);
    const enrichedDetails = {
      ...details,
      location,
      ip,
      userAgent: req?.headers['user-agent']?.substring(0, 120) || 'Unknown Browser'
    };

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId || null, action, entityType, String(entityId || ''), JSON.stringify(enrichedDetails), ip]
    );
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
}

module.exports = {
  recordAuditLog,
  extractClientContext
};
