const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rymec_secret_jwt_key_2026_super_secure';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Authorized roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
}

// Anonymous Identity Protection:
// Masks student name snapshot and student profile unless viewer is the student themselves
// or the Principal with high-level institutional audit oversight.
function maskAnonymousData(complaint, user) {
  if (!complaint) return complaint;
  const isOwner = user && user.id === complaint.student_id;
  const isPrincipal = user && user.role === 'principal';

  if (complaint.is_anonymous && !isOwner && !isPrincipal) {
    return {
      ...complaint,
      student_name_snapshot: 'Anonymous Student',
      student_name: 'Anonymous Student',
      student_email: '[Protected Anonymous]',
      student_usn: '[Protected Anonymous]',
      student_id: null
    };
  }
  return complaint;
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  maskAnonymousData,
  JWT_SECRET
};
