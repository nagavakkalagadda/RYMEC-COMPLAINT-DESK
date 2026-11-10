-- RYMEC GRIEVANCE DESK - PostgreSQL Database Schema
-- Institution: Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Ballari

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  category_mapping VARCHAR(50) NOT NULL,
  contact_email VARCHAR(150),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('student', 'lecturer', 'warden', 'hod', 'mentor', 'principal')),
  usn_roll VARCHAR(50),
  department VARCHAR(100),
  academic_year VARCHAR(30),
  hostel_block VARCHAR(50),
  designation VARCHAR(100),
  is_verified BOOLEAN DEFAULT TRUE,
  verification_code VARCHAR(10),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  complaint_number VARCHAR(50) UNIQUE NOT NULL,
  student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  student_name_snapshot VARCHAR(150),
  title VARCHAR(250) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('hostel', 'academic', 'harassment', 'admin', 'other')),
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'resolved', 'rejected', 'reopened')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sla_deadline TIMESTAMPTZ NOT NULL,
  is_escalated BOOLEAN DEFAULT FALSE,
  escalation_level INTEGER DEFAULT 0,
  escalation_reason TEXT,
  reopening_count INTEGER DEFAULT 0,
  reopening_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS complaint_attachments (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_timeline (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  action_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  remark TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_ratings (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_number ON complaints(complaint_number);
CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON complaint_timeline(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
