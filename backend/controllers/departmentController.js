const db = require('../config/db');

async function getDepartments(req, res) {
  try {
    const result = await db.query(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM complaints WHERE department_id = d.id) as total_complaints,
        (SELECT COUNT(*) FROM complaints WHERE department_id = d.id AND status = 'resolved') as resolved_complaints
      FROM departments d
      ORDER BY d.name ASC;
    `);
    return res.json({ departments: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createDepartment(req, res) {
  try {
    const { name, code, category_mapping, contact_email, description } = req.body;
    if (!name || !code || !category_mapping) {
      return res.status(400).json({ error: 'Name, code, and category mapping are required.' });
    }

    const insertSql = `
      INSERT INTO departments (name, code, category_mapping, contact_email, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await db.query(insertSql, [
      name.trim(),
      code.trim().toUpperCase(),
      category_mapping,
      contact_email || null,
      description || null
    ]);

    return res.status(201).json({ department: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDepartments,
  createDepartment
};
