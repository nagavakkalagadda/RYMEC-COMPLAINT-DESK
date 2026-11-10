export type UserRole = 'student' | 'lecturer' | 'warden' | 'hod' | 'mentor' | 'principal';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  usn_roll?: string;
  academic_year?: string;
  hostel_block?: string;
  designation?: string;
  is_verified?: boolean;
}

export type ComplaintCategory = 'hostel' | 'academic' | 'harassment' | 'admin' | 'other';
export type ComplaintPriority = 'normal' | 'high' | 'urgent';
export type ComplaintStatus = 'pending' | 'review' | 'resolved' | 'rejected' | 'reopened';

export interface TimelineEvent {
  id: number;
  complaint_id: number;
  action_by?: number;
  author_name?: string;
  action_role: string;
  status: string;
  remark: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  complaint_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

export interface Rating {
  id: number;
  complaint_id: number;
  student_id: number;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  complaint_number: string;
  student_id?: number | null;
  is_anonymous: boolean;
  student_name_snapshot?: string;
  student_email?: string;
  student_usn?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department_id?: number;
  department_name?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to?: number;
  sla_deadline: string;
  is_escalated: boolean;
  escalation_level: number;
  escalation_reason?: string;
  reopening_count: number;
  reopening_reason?: string;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  category_mapping: string;
  contact_email?: string;
  description?: string;
  total_complaints?: number;
  resolved_complaints?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface TrendAlert {
  category: string;
  count: number;
  keywords: string;
  severity: 'critical' | 'warning';
  message: string;
}
