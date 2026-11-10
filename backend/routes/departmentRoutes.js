const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', getDepartments);
router.post('/', authenticateToken, requireRole(['principal']), createDepartment);

module.exports = router;
