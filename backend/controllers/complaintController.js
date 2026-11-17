const db = require('../config/db');
const QRCode = require('qrcode');
const {
  autoCategorize,
  detectPriority,
  calculateSlaDeadline,
  detectDuplicates,
  predictResolutionTime
} = require('../services/aiService');
const { sendEmailNotification, createEmailTemplate } = require('../services/emailService');
const { maskAnonymousData } = require('../middleware/auth');
const { recordAuditLog } = require('../services/auditService');

// Unique ID generator format: GRV-2026-XXXXX
function generateComplaintId() {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GRV-${year}-${randomHex}`;
}

// 1. Submit Complaint
async function submitComplaint(req, res) {
  try {
    const {
      title,
      description,
      category: requestedCategory,
      department_id,
      is_anonymous = false,
      target_role = 'auto'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and detailed description are required.' });
    }

    // Evidence Validation (Photos: max 200KB each, Video: max 2MB)
    const filesToProcess = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    if (filesToProcess.length > 0) {
      let videoCount = 0;
      for (const f of filesToProcess) {
        const isVideo = f.mimetype && f.mimetype.startsWith('video/');
        if (isVideo) {
          videoCount++;
          if (videoCount > 1) {
            return res.status(400).json({ error: 'Please upload at most 1 video clip for evidence.' });
          }
          if (f.size > 2 * 1024 * 1024) {
            return res.status(400).json({ 
              error: `Video file "${f.originalname}" (${(f.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 2 MB.` 
            });
          }
        } else {
          if (f.size > 200 * 1024) {
            return res.status(400).json({ 
              error: `Photo "${f.originalname}" (${(f.size / 1024).toFixed(1)} KB) exceeds the maximum allowed size of 200 KB per photo.` 
            });
          }
        }
      }
    }

    const studentId = req.user ? req.user.id : null;
    const studentName = req.user ? req.user.name : 'Guest User';
    const studentEmail = req.user ? req.user.email : null;

    // AI Auto-categorization
    const aiCat = autoCategorize(title + ' ' + description);
    const finalCategory = requestedCategory && ['hostel', 'academic', 'harassment', 'admin', 'other'].includes(requestedCategory)
      ? requestedCategory
      : aiCat.category;

    // AI Priority Detection
    const prioResult = detectPriority(title + ' ' + description);
    const finalPriority = prioResult.priority;

    // SLA Calculation
    const slaDeadline = calculateSlaDeadline(finalPriority);

    // Duplicate Detection against recent complaints
    const recentRes = await db.query(
      `SELECT id, complaint_number, title, description, category, created_at, status 
       FROM complaints WHERE created_at >= NOW() - INTERVAL '14 days'`
    );
    const duplicateMatch = detectDuplicates(title + ' ' + description, finalCategory, recentRes.rows);

    // Predictive Resolution estimate
    const prediction = predictResolutionTime(finalCategory, finalPriority);

    // Department routing: if department_id is not given, find department matching category
    let targetDeptId = department_id ? Number(department_id) : null;
    if (!targetDeptId) {
      const deptRes = await db.query(
        'SELECT id FROM departments WHERE category_mapping = $1 LIMIT 1',
        [finalCategory]
      );
      if (deptRes.rows.length > 0) {
        targetDeptId = deptRes.rows[0].id;
      }
    }

    const complaintNumber = generateComplaintId();

    const selectedRole = target_role && ['mentor', 'hod', 'warden', 'lecturer', 'principal'].includes(target_role.toLowerCase())
      ? target_role.toLowerCase()
      : 'auto';

    let targetFacultyId = null;
    if (selectedRole !== 'auto') {
      const facultyRes = await db.query(
        'SELECT id FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1',
        [selectedRole]
      );
      if (facultyRes.rows.length > 0) {
        targetFacultyId = facultyRes.rows[0].id;
      }
    }

    const insertSql = `
      INSERT INTO complaints (
        complaint_number, student_id, is_anonymous, student_name_snapshot,
        title, description, category, department_id, priority, status, sla_deadline,
        target_role, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const complaintRes = await db.query(insertSql, [
      complaintNumber,
      studentId,
      Boolean(is_anonymous),
      is_anonymous ? 'Anonymous Student' : studentName,
      title.trim(),
      description.trim(),
      finalCategory,
      targetDeptId,
      finalPriority,
      'pending',
      slaDeadline,
      selectedRole,
      targetFacultyId
    ]);

    const complaint = complaintRes.rows[0];

    // Handle File Attachment(s) if present (in-memory buffer or disk file)
    const savedAttachments = [];
    for (const f of filesToProcess) {
      let fileUrl;
      if (f.buffer) {
        fileUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      } else if (f.filename) {
        fileUrl = `/uploads/${f.filename}`;
      } else {
        fileUrl = `/uploads/${f.originalname}`;
      }

      const attachRes = await db.query(
        `INSERT INTO complaint_attachments (complaint_id, file_name, file_url, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
          complaint.id,
          f.originalname,
          fileUrl,
          f.size,
          f.mimetype
        ]
      );
      if (attachRes.rows && attachRes.rows.length > 0) {
        savedAttachments.push(attachRes.rows[0]);
      }
    }
    const attachmentData = savedAttachments[0] || null;

    // Initial Timeline Event
    const roleRemark = selectedRole !== 'auto' 
      ? ` Specifically routed to ${selectedRole.toUpperCase()} for direct redressal.` 
      : '';
    await db.query(
      `INSERT INTO complaint_timeline (complaint_id, action_by, action_role, status, remark)
       VALUES ($1, $2, $3, $4, $5);`,
      [
        complaint.id,
        studentId,
        'student',
        'pending',
        (is_anonymous 
          ? 'Grievance submitted in Anonymous mode. Student identity protected.' 
          : 'Grievance filed by student.') + roleRemark
      ]
    );

    // In-app Notification for student
    if (studentId) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, link)
         VALUES ($1, $2, $3, $4);`,
        [
          studentId,
          `Grievance Registered: ${complaintNumber}`,
          `Your complaint regarding "${title}" has been registered. Priority: ${finalPriority.toUpperCase()}. SLA Target: ${slaDeadline.toLocaleDateString()}.`,
          `/track/${complaintNumber}`
        ]
      );
    }

    // Generate QR Code data URL
    const trackUrl = `${process.env.APP_URL || 'http://localhost:5173'}/track?id=${complaintNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackUrl, {
      margin: 2,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF'
      }
    });

    // Send confirmation email to student
    if (studentEmail) {
      await sendEmailNotification({
        to: studentEmail,
        subject: `Grievance Acknowledged - ${complaintNumber}`,
        eventType: 'submission',
        complaintNumber,
        html: createEmailTemplate(
          'Grievance Registered Successfully',
          `<p>Dear <b>${is_anonymous ? 'Student' : studentName}</b>,</p>
           <p>Your grievance has been officially registered with the RYMEC Grievance Redressal Committee.</p>
           <p><b>Title:</b> ${title}</p>
           <p><b>Category:</b> ${finalCategory.toUpperCase()}</p>
           <p><b>Priority:</b> <span style="color: ${finalPriority === 'urgent' ? '#EF4444' : '#38BDF8'}">${finalPriority.toUpperCase()}</span></p>
           <p><b>Estimated Resolution:</b> ${prediction.displayText}</p>
           <p>Scan your unique QR code or use the ID below to monitor live milestone progress.</p>`,
          complaintNumber
        ),
        plainText: `Your grievance ${complaintNumber} has been received. Track status with ID: ${complaintNumber}`
      });
    }

    // Send admin notification to host email (rymec.ismart12@gmail.com)
    const hostAdminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER || 'rymec.ismart12@gmail.com';
    try {
      await sendEmailNotification({
        to: hostAdminEmail,
        subject: `[PORTAL ALERT] New Grievance: ${complaintNumber} (${finalPriority.toUpperCase()})`,
        eventType: 'admin_alert',
        complaintNumber,
        html: createEmailTemplate(
          `New Grievance Submitted: ${title}`,
          `<p>A new student grievance has been logged on the portal.</p>
           <p><b>Reference Number:</b> ${complaintNumber}</p>
           <p><b>Submitted By:</b> ${is_anonymous ? 'Anonymous Student' : studentName} (${studentEmail || 'N/A'})</p>
           <p><b>Category:</b> ${finalCategory.toUpperCase()}</p>
           <p><b>Priority:</b> ${finalPriority.toUpperCase()}</p>
           <p><b>Description:</b> ${description}</p>`,
          complaintNumber
        ),
        plainText: `New grievance ${complaintNumber} registered by ${is_anonymous ? 'Anonymous' : studentName}: ${title}`
      });
    } catch (e) {
      console.warn('Host admin notification warning:', e.message);
    }

    try {
      await recordAuditLog(req, req.user?.id, 'COMPLAINT_SUBMITTED', 'complaint', complaint.id, {
        complaintNumber: complaint.complaint_number,
        category: complaint.category,
        priority: complaint.priority,
        isAnonymous: complaint.is_anonymous
      });
    } catch (auditErr) {}

    return res.status(201).json({
      message: 'Grievance submitted successfully',
      complaint: maskAnonymousData(complaint, req.user),
      attachment: attachmentData,
      attachments: savedAttachments,
      qrCode: qrCodeDataUrl,
      prediction,
      duplicateWarning: duplicateMatch,
      priorityDetection: prioResult
    });
  } catch (err) {
    console.error('Submit complaint error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

// 2. Track Complaint by Complaint Number (Public or Authenticated)
async function trackComplaint(req, res) {
  try {
    const { complaintNumber } = req.params;

    const compRes = await db.query(
      `SELECT c.*, d.name as department_name, d.contact_email as department_email
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.complaint_number = $1`,
      [complaintNumber.trim()]
    );

    if (compRes.rows.length === 0) {
      return res.status(404).json({ error: 'No complaint found matching ID ' + complaintNumber });
    }

    let complaint = compRes.rows[0];

    // Fetch timeline
    const timelineRes = await db.query(
      `SELECT t.*, u.full_name as author_name 
       FROM complaint_timeline t
       LEFT JOIN users u ON t.action_by = u.id
       WHERE t.complaint_id = $1
       ORDER BY t.created_at ASC`,
      [complaint.id]
    );

    // Fetch attachments
    const attachRes = await db.query(
      'SELECT * FROM complaint_attachments WHERE complaint_id = $1',
      [complaint.id]
    );

    // Fetch ratings if resolved
    const ratingRes = await db.query(
      'SELECT * FROM complaint_ratings WHERE complaint_id = $1 LIMIT 1',
      [complaint.id]
    );

    // Mask identity if anonymous
    complaint = maskAnonymousData(complaint, req.user);

    // Compute SLA status
    const now = new Date();
    const deadline = new Date(complaint.sla_deadline);
    const msLeft = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 3600 * 24));

    let slaStatus = 'on_track';
    if (complaint.status === 'resolved' || complaint.status === 'rejected') {
      slaStatus = 'closed';
    } else if (daysLeft < 0) {
      slaStatus = 'overdue';
    } else if (daysLeft <= 1) {
      slaStatus = 'critical';
    }

    return res.json({
      complaint,
      timeline: timelineRes.rows,
      attachments: attachRes.rows,
      rating: ratingRes.rows[0] || null,
      sla: {
        deadline: complaint.sla_deadline,
        daysLeft,
        status: slaStatus,
        displayText: slaStatus === 'closed' ? 'Closed' : daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days remaining`
      }
    });
  } catch (err) {
    console.error('Track complaint error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// 3. Get Student's Own Complaints
async function getMyComplaints(req, res) {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      `SELECT c.*, d.name as department_name,
        (SELECT COUNT(*) FROM complaint_attachments WHERE complaint_id = c.id) as attachment_count,
        COALESCE((SELECT json_agg(a.*) FROM complaint_attachments a WHERE a.complaint_id = c.id), '[]'::json) as attachments,
        (SELECT rating FROM complaint_ratings WHERE complaint_id = c.id LIMIT 1) as satisfaction_rating
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.student_id = $1
       ORDER BY c.created_at DESC`,
      [studentId]
    );

    return res.json({ complaints: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// 4. Get Role-Filtered Complaints for Staff / Admin
async function getAllComplaints(req, res) {
  try {
    const user = req.user;
    const { category, status, priority, department_id, search, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT c.*, d.name as department_name, u.email as student_email, u.usn_roll as student_usn,
        (SELECT rating FROM complaint_ratings WHERE complaint_id = c.id LIMIT 1) as satisfaction_rating,
        COALESCE((SELECT json_agg(a.*) FROM complaint_attachments a WHERE a.complaint_id = c.id), '[]'::json) as attachments
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.student_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Role-based visibility enforcement (supporting category mapping, target_role, and assigned_to)
    if (user.role === 'lecturer') {
      queryParams.push('academic');
      queryText += ` AND (c.category = $${queryParams.length} OR c.target_role = 'lecturer' OR c.assigned_to = ${user.id})`;
    } else if (user.role === 'warden') {
      queryParams.push('hostel');
      queryText += ` AND (c.category = $${queryParams.length} OR c.target_role = 'warden' OR c.assigned_to = ${user.id})`;
    } else if (user.role === 'hod') {
      if (user.department) {
        queryParams.push(`%${user.department.trim()}%`);
        queryText += ` AND (d.name ILIKE $${queryParams.length} OR c.category = 'academic' OR c.target_role = 'hod' OR c.assigned_to = ${user.id})`;
      } else {
        queryText += ` AND (c.category = 'academic' OR c.target_role = 'hod' OR c.assigned_to = ${user.id})`;
      }
    } else if (user.role === 'mentor') {
      queryParams.push('other');
      queryText += ` AND (c.category = $${queryParams.length} OR c.target_role = 'mentor' OR c.assigned_to = ${user.id})`;
    }
    // 'principal' sees all records without role filters

    // Optional filters
    if (category) {
      queryParams.push(category);
      queryText += ` AND c.category = $${queryParams.length}`;
    }
    if (status) {
      queryParams.push(status);
      queryText += ` AND c.status = $${queryParams.length}`;
    }
    if (priority) {
      queryParams.push(priority);
      queryText += ` AND c.priority = $${queryParams.length}`;
    }
    if (department_id) {
      queryParams.push(Number(department_id));
      queryText += ` AND c.department_id = $${queryParams.length}`;
    }
    if (search) {
      queryParams.push(`%${search.trim()}%`);
      queryText += ` AND (c.title ILIKE $${queryParams.length} OR c.complaint_number ILIKE $${queryParams.length} OR c.description ILIKE $${queryParams.length})`;
    }

    queryText += ` ORDER BY 
      CASE WHEN c.priority = 'urgent' THEN 1 WHEN c.priority = 'high' THEN 2 ELSE 3 END,
      c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    queryParams.push(Number(limit), Number(offset));

    const result = await db.query(queryText, queryParams);

    // Apply anonymous protection mask
    const masked = result.rows.map(c => maskAnonymousData(c, user));

    return res.json({ complaints: masked });
  } catch (err) {
    console.error('Get all complaints error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// 5. Update Status & Add Remarks
async function updateStatus(req, res) {
  try {
    const { complaintId } = req.params;
    const { status, remarks = '', assigned_to = null } = req.body;

    const validStatuses = ['pending', 'review', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const compRes = await db.query('SELECT * FROM complaints WHERE id = $1', [complaintId]);
    if (compRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = compRes.rows[0];
    const resolvedAt = status === 'resolved' ? new Date() : null;

    const updateSql = `
      UPDATE complaints 
      SET status = $1, 
          assigned_to = COALESCE($2, assigned_to),
          resolved_at = COALESCE($3, resolved_at),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;

    const updatedRes = await db.query(updateSql, [status, assigned_to, resolvedAt, complaintId]);
    const updatedComplaint = updatedRes.rows[0];

    // Record Timeline
    await db.query(
      `INSERT INTO complaint_timeline (complaint_id, action_by, action_role, status, remark)
       VALUES ($1, $2, $3, $4, $5);`,
      [
        complaintId,
        req.user.id,
        req.user.role,
        status,
        remarks || `Status transitioned to ${status.toUpperCase()} by ${req.user.name} (${req.user.role.toUpperCase()}).`
      ]
    );

    // Audit Log with location and IP telemetry
    try {
      await recordAuditLog(req, req.user.id, 'STATUS_UPDATE', 'complaint', complaintId, {
        from: complaint.status,
        to: status,
        remarks
      });
    } catch (auditErr) {}

    // Send Notification to Student if exists
    if (complaint.student_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, link)
         VALUES ($1, $2, $3, $4);`,
        [
          complaint.student_id,
          `Status Update: ${complaint.complaint_number}`,
          `Your grievance status is now: ${status.toUpperCase()}. Remark: ${remarks || 'Review in progress.'}`,
          `/track/${complaint.complaint_number}`
        ]
      );

      // Email student
      const studentRes = await db.query('SELECT email, full_name FROM users WHERE id = $1', [complaint.student_id]);
      if (studentRes.rows.length > 0) {
        const student = studentRes.rows[0];
        await sendEmailNotification({
          to: student.email,
          subject: `Status Update on Grievance ${complaint.complaint_number}`,
          eventType: 'status_update',
          complaintNumber: complaint.complaint_number,
          html: createEmailTemplate(
            `Status Updated to ${status.toUpperCase()}`,
            `<p>Dear <b>${student.full_name}</b>,</p>
             <p>An official update has been issued for your registered grievance.</p>
             <p><b>Status:</b> <span style="font-weight:bold; color: #38BDF8;">${status.toUpperCase()}</span></p>
             <p><b>Official Remarks:</b> ${remarks || 'Processed as per institutional redressal guidelines.'}</p>
             ${status === 'resolved' ? '<p>Please take 30 seconds to rate the resolution satisfaction on your student dashboard.</p>' : ''}`,
            complaint.complaint_number
          ),
          plainText: `Grievance ${complaint.complaint_number} updated to ${status}. Remark: ${remarks}`
        });
      }
    }

    return res.json({
      message: 'Complaint updated successfully',
      complaint: maskAnonymousData(updatedComplaint, req.user)
    });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// 6. Reopen Complaint (Students can reopen resolved complaints with justification)
async function reopenComplaint(req, res) {
  try {
    const { complaintId } = req.params;
    const { justification } = req.body;

    if (!justification || justification.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a clear justification for reopening this complaint (minimum 10 characters).' });
    }

    const compRes = await db.query('SELECT * FROM complaints WHERE id = $1', [complaintId]);
    if (compRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = compRes.rows[0];

    if (complaint.student_id !== req.user.id && req.user.role !== 'principal') {
      return res.status(403).json({ error: 'You are only authorized to reopen your own complaints.' });
    }

    if (complaint.status !== 'resolved' && complaint.status !== 'rejected') {
      return res.status(400).json({ error: 'Only resolved or rejected complaints can be reopened.' });
    }

    if (complaint.reopening_count >= 2) {
      return res.status(400).json({ error: 'This complaint has reached the maximum reopening limit (2 times). Please file a fresh grievance.' });
    }

    const newCount = (complaint.reopening_count || 0) + 1;

    // Reset status to review and extend SLA by 3 days for re-examination
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + 3);

    const updateSql = `
      UPDATE complaints 
      SET status = 'reopened',
          reopening_count = $1,
          reopening_reason = $2,
          sla_deadline = $3,
          is_escalated = true,
          escalation_level = 1,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;

    const updatedRes = await db.query(updateSql, [newCount, justification.trim(), newDeadline, complaintId]);

    // Timeline event
    await db.query(
      `INSERT INTO complaint_timeline (complaint_id, action_by, action_role, status, remark)
       VALUES ($1, $2, $3, $4, $5);`,
      [
        complaintId,
        req.user.id,
        'student',
        'reopened',
        `Reopened by student (Attempt ${newCount}/2). Reason: "${justification.trim()}". Escalated for senior committee re-evaluation.`
      ]
    );

    return res.json({
      message: 'Complaint successfully reopened and escalated for senior re-examination.',
      complaint: updatedRes.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// 7. Rate Satisfaction (1-5 stars)
async function rateComplaint(req, res) {
  try {
    const { complaintId } = req.params;
    const { rating, feedback = '' } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const compRes = await db.query('SELECT * FROM complaints WHERE id = $1', [complaintId]);
    if (compRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const complaint = compRes.rows[0];
    if (complaint.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the filing student can rate this complaint resolution.' });
    }

    // Insert or update rating
    await db.query(
      `INSERT INTO complaint_ratings (complaint_id, student_id, rating, feedback)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (complaint_id) DO UPDATE SET rating = $3, feedback = $4;`,
      [complaintId, req.user.id, numRating, feedback.trim()]
    ).catch(async () => {
      // Fallback if table lacks unique constraint on complaint_id
      await db.query(
        `INSERT INTO complaint_ratings (complaint_id, student_id, rating, feedback)
         VALUES ($1, $2, $3, $4)`,
        [complaintId, req.user.id, numRating, feedback.trim()]
      );
    });

    return res.json({ message: 'Thank you for your feedback! Your rating has been recorded.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// 8. Public Transparency Board (Anonymized resolved complaints feed)
async function getPublicResolvedFeed(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        c.complaint_number,
        c.title,
        c.category,
        c.created_at,
        c.resolved_at,
        c.priority,
        d.name as department_name,
        ROUND(EXTRACT(EPOCH FROM (COALESCE(c.resolved_at, c.updated_at) - c.created_at)) / 86400, 1) as resolution_days,
        (SELECT rating FROM complaint_ratings WHERE complaint_id = c.id LIMIT 1) as rating
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.status = 'resolved'
      ORDER BY c.resolved_at DESC NULLS LAST
      LIMIT 20;
    `);

    return res.json({ feed: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  submitComplaint,
  trackComplaint,
  getMyComplaints,
  getAllComplaints,
  updateStatus,
  reopenComplaint,
  rateComplaint,
  getPublicResolvedFeed
};
