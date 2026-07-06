// Full-Stack API Helper for Ethio Matric Learning Platform
// Automatically attaches auth token, manages endpoints, and handles error handling gracefully.

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('ethio_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication & Profile
  async register(userData: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async login(credentials: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  // Subjects & Topics
  async getSubjects() {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createSubject(subject: any) {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subject),
    });
    return res.json();
  },

  async updateSubject(id: number, subject: any) {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subject),
    });
    return res.json();
  },

  async deleteSubject(id: number) {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTopics() {
    const res = await fetch(`${API_BASE}/topics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createTopic(topic: any) {
    const res = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(topic),
    });
    return res.json();
  },

  async updateTopic(id: number, topic: any) {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(topic),
    });
    return res.json();
  },

  async deleteTopic(id: number) {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Questions
  async getQuestions(filters: Record<string, string | number> = {}) {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`${API_BASE}/questions?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getQuestionById(id: number) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async searchQuestions(q: string) {
    const res = await fetch(`${API_BASE}/questions/search?q=${encodeURIComponent(q)}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createQuestion(question: any) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(question),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create question');
    return data;
  },

  async updateQuestion(id: number, question: any) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(question),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update question');
    return data;
  },

  async deleteQuestion(id: number) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete question');
    return data;
  },

  // Progress, Answers & Bookmarks
  async getProgress(userId: number) {
    const res = await fetch(`${API_BASE}/progress/${userId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async submitAnswer(answerData: { user_id: number; question_id: number; selected_answer: string }) {
    const res = await fetch(`${API_BASE}/answers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(answerData),
    });
    return res.json();
  },

  async toggleBookmark(user_id: number, question_id: number) {
    const res = await fetch(`${API_BASE}/bookmarks/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id, question_id }),
    });
    return res.json();
  },

  async getBookmarks(userId: number) {
    const res = await fetch(`${API_BASE}/bookmarks/${userId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Mock Exams
  async getMockExams() {
    const res = await fetch(`${API_BASE}/mock-exams`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getMockExamById(id: number) {
    const res = await fetch(`${API_BASE}/mock-exams/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async submitMockExam(payload: { user_id: number; mock_exam_id: number; score: number; total_questions: number }) {
    const res = await fetch(`${API_BASE}/mock-exams/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Admin Specific
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load admin stats');
    return data;
  },

  async getAdminUsers(search: string = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/admin/users${query}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load users');
    return data;
  },

  async getAdminUserDetail(id: number) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load user detail');
    return data;
  },

  async updateAdminUser(id: number, userData: any) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    return data;
  },

  async deleteAdminUser(id: number) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  },

  async resetUserPassword(id: number, passwordData: any) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password');
    return data;
  },

  async getAdminNotifications() {
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load notifications');
    return data;
  },

  async markNotificationRead(id: number) {
    const res = await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update notification');
    return data;
  },

  async clearNotifications() {
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clear notifications');
    return data;
  },

  // NEW Admin Payments & User Controls & Bulk operations
  async suspendUser(id: number) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/suspend`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to suspend user');
    return data;
  },

  async activateUser(id: number) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/activate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to activate user');
    return data;
  },

  async changeUserMembership(id: number, planId: number) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/membership`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan_id: planId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change membership');
    return data;
  },

  async updatePlan(id: number, planData: any) {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update plan');
    return data;
  },

  async getAdminPayments() {
    const res = await fetch(`${API_BASE}/admin/payments`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');
    return data;
  },

  async approvePayment(id: number) {
    const res = await fetch(`${API_BASE}/admin/payments/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to approve payment');
    return data;
  },

  async rejectPayment(id: number, reason: string) {
    const res = await fetch(`${API_BASE}/admin/payments/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reject payment');
    return data;
  },

  async bulkDeleteQuestions(ids: number[]) {
    const res = await fetch(`${API_BASE}/admin/questions/bulk-delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to bulk delete questions');
    return data;
  },

  async bulkUpdateQuestions(ids: number[], updateData: any) {
    const res = await fetch(`${API_BASE}/admin/questions/bulk-update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids, ...updateData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to bulk update questions');
    return data;
  },

  async importQuestions(questions: any[]) {
    const res = await fetch(`${API_BASE}/admin/questions/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to import questions');
    return data;
  },
};
