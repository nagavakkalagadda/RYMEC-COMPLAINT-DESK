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

async function handleResponse(res: Response, defaultError = 'Request failed') {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) {
      throw new Error(text && text.length < 250 ? text : `Server error (${res.status}: ${res.statusText || 'Internal Error'})`);
    }
    return text;
  }
  if (!res.ok) {
    const errorMsg = data?.error || data?.message || defaultError;
    const err: any = new Error(errorMsg);
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(res, 'Failed to login');
  },

  async register(formData: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return await handleResponse(res, 'Failed to register');
  },

  async verifyOtp(email: string, code: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return await handleResponse(res, 'OTP verification failed');
  },

  async resendOtp(email: string) {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(res, 'Failed to resend OTP');
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(res, 'Failed to request password reset code');
  },

  async verifyResetOtp(email: string, code: string) {
    const res = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return await handleResponse(res, 'Invalid or expired OTP code');
  },

  async resetPassword(email: string, code: string, new_password: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password }),
    });
    return await handleResponse(res, 'Failed to reset password');
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res, 'Failed to fetch user profile');
  },

  async updateProfile(profileData: any) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(res, 'Failed to update profile');
  },

  async changePassword(current_password: string, new_password: string) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    });
    return await handleResponse(res, 'Failed to change password');
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return await handleResponse(res, 'Failed to fetch demo accounts');
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
    return await handleResponse(res, 'Submission failed');
  },

  async trackComplaint(id: string) {
    const res = await fetch(`${API_BASE}/complaints/track/${id}`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res, 'Complaint not found');
  },

  async getMyComplaints() {
    const res = await fetch(`${API_BASE}/complaints/my`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(res, 'Failed to load complaints');
    return data.complaints || [];
  },

  async getAllComplaints(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints/all?${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(res, 'Failed to fetch complaints queue');
    return data.complaints || [];
  },

  async updateStatus(complaintId: number, status: string, remarks: string, assignedTo?: number) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, remarks, assigned_to: assignedTo }),
    });
    return await handleResponse(res, 'Failed to update status');
  },

  async reopenComplaint(complaintId: number, justification: string) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/reopen`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ justification }),
    });
    return await handleResponse(res, 'Failed to reopen complaint');
  },

  async rateComplaint(complaintId: number, rating: number, feedback: string) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, feedback }),
    });
    return await handleResponse(res, 'Failed to submit rating');
  },

  async getPublicFeed() {
    const res = await fetch(`${API_BASE}/complaints/public-feed`);
    const data = await handleResponse(res, 'Failed to load public feed');
    return data.feed || [];
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res, 'Failed to fetch analytics');
  },

  // Departments
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    const data = await handleResponse(res, 'Failed to fetch departments');
    return data.departments || [];
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res, 'Failed to fetch notifications');
  },

  async markNotificationRead(id: string | number) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return await handleResponse(res, 'Failed to mark notification read');
  },

  async getDevOutbox() {
    const res = await fetch(`${API_BASE}/notifications/dev-outbox`);
    const data = await handleResponse(res, 'Failed to fetch dev outbox');
    return data.outbox || [];
  }
};
