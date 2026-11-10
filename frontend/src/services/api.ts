const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('rymec_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async register(formData: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return await res.json();
  },

  // Complaints
  async submitComplaint(formData: FormData) {
    const token = localStorage.getItem('rymec_auth_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/complaints/submit`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    return data;
  },

  async trackComplaint(id: string) {
    const res = await fetch(`${API_BASE}/complaints/track/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Complaint not found');
    return data;
  },

  async getMyComplaints() {
    const res = await fetch(`${API_BASE}/complaints/my`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load complaints');
    return data.complaints;
  },

  async getAllComplaints(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints/all?${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaints queue');
    return data.complaints;
  },

  async updateStatus(complaintId: number, status: string, remarks: string, assignedTo?: number) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, remarks, assigned_to: assignedTo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
  },

  async reopenComplaint(complaintId: number, justification: string) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/reopen`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ justification }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reopen complaint');
    return data;
  },

  async rateComplaint(complaintId: number, rating: number, feedback: string) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, feedback }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
    return data;
  },

  async getPublicFeed() {
    const res = await fetch(`${API_BASE}/complaints/public-feed`);
    const data = await res.json();
    return data.feed;
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
    return data;
  },

  async getAuditLogs(offset = 0) {
    const res = await fetch(`${API_BASE}/analytics/audit-logs?offset=${offset}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return data.logs;
  },

  // Departments
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    const data = await res.json();
    return data.departments;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data;
  },

  async markNotificationRead(id: string | number) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getDevOutbox() {
    const res = await fetch(`${API_BASE}/notifications/dev-outbox`);
    const data = await res.json();
    return data.outbox;
  }
};
