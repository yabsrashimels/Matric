import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const formatDisplayDate = (value: string | null | undefined) => {
  if (!value) return '—';

  const trimmed = String(value).trim();
  if (!trimmed) return '—';

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;

  return date.toLocaleString();
};
import {
  Users, BookOpen, Target, Award, Key, Shield, LogIn, UserPlus, LogOut,
  RefreshCw, Search, Edit, Trash2, CheckCircle2, AlertTriangle,
  Plus, X, BarChart3, Bell, Eye, Database, FileText, LayoutDashboard,
  Check, Info, Clock, Calendar, HelpCircle, Ban, ArrowUpCircle, Settings
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend, Cell
} from 'recharts';

interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: number;
  school: string;
  region: string;
  role: string;
  status: string; // 'Active' or 'Suspended'
  created_at: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const { logout } = useApp();
  // Authentication operator context
  const [isAdmin, setIsAdmin] = useState(false);
  const [operatorName, setOperatorName] = useState('Administrator');
  const [loading, setLoading] = useState(false);

  // Admin Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'payments' | 'plans' | 'syllabus' | 'questions' | 'exams'>('dashboard');

  // Stats & logs
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Student controls
  const [users, setUsers] = useState<User[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Payment Requests Dashboard
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({ approvedCount: 0, pendingCount: 0, totalRevenue: 0 });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  // Plan tiers
  const [plans, setPlans] = useState<any[]>([
    { id: 1, name: 'Free', price: 0, description: 'Basic trial access to selected Grade 12 subjects' },
    { id: 2, name: 'Premium', price: 100, description: 'Full access to intermediate mock tests & study planners' },
    { id: 3, name: 'Advanced', price: 500, description: 'Complete access to advanced subjects & national tests' },
  ]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ price: 0, description: '' });

  // Syllabus management states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [newTopicSubjectId, setNewTopicSubjectId] = useState<number>(0);
  const [newTopicName, setNewTopicName] = useState('');

  // Questions database states
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [questionsPagination, setQuestionsPagination] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [questionFilters, setQuestionFilters] = useState({ subject: '', difficulty: '', year: '', page: 1, limit: 10 });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionForm, setQuestionForm] = useState({
    id: undefined as number | undefined,
    subject_id: '',
    topic_id: '',
    year: new Date().getFullYear(),
    difficulty: 'Medium',
    plan_id: 1,
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    reference: '',
    hint: '',
    estimated_time: 60
  });

  // Bulk operation imports
  const [showImportModal, setShowImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkPlanId, setBulkPlanId] = useState(1);

  // Mock exams compiler
  const [mockExams, setMockExams] = useState<any[]>([]);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(120);
  const [newExamSelectedQuestionIds, setNewExamSelectedQuestionIds] = useState<number[]>([]);

  // Validation overlays
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userResetPasswordId, setUserResetPasswordId] = useState<number | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Validate admin token on mount
  useEffect(() => {
    const token = localStorage.getItem('ethio_token');
    const role = localStorage.getItem('ethio_role');
    const name = localStorage.getItem('ethio_user_name');
    if (token && role === 'admin') {
      setIsAdmin(true);
      if (name) setOperatorName(name);
      loadAdminData();
    }
  }, []);

  // Sync tab data
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'dashboard') {
        loadStats();
        loadNotifications();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'payments') {
        loadPayments();
      } else if (activeTab === 'syllabus') {
        loadSyllabus();
      } else if (activeTab === 'questions') {
        loadSyllabus();
        loadQuestions();
      } else if (activeTab === 'exams') {
        loadExams();
        loadQuestions({ limit: 100 });
      }
    }
  }, [isAdmin, activeTab, questionFilters.subject, questionFilters.difficulty, questionFilters.year, questionFilters.page]);

  const loadAdminData = () => {
    loadStats();
    loadNotifications();
  };

  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getAdminNotifications();
      if (res.success) setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAdminUsers(searchUserQuery);
      if (res.success) setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await api.getAdminPayments();
      if (res.success) {
        // Backend returns payments under res.data.payments; accept multiple shapes and normalize
        const rawPayments = res.data.payments || res.data.requests || res.data || [];
        const normalized = (rawPayments || []).map((p: any) => ({
          ...p,
          student_name: p.student_name || (p.first_name || p.last_name ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : ''),
          student_email: p.student_email || p.email || p.user_email || p.user_email_address || '',
          screenshot_url: p.screenshot_url || p.screenshot || p.image_url || null,
          created_at: p.created_at || p.createdAt || p.date || null,
          status: p.status || 'Pending',
          plan_name: p.plan_name || p.name || '',
        }));

        setPayments(normalized);
        setPaymentStats(res.data.stats || res.data.stats || { approvedCount: 0, pendingCount: 0, totalRevenue: 0 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSyllabus = async () => {
    try {
      const subRes = await api.getSubjects();
      const topRes = await api.getTopics();
      if (subRes.success) setSubjects(subRes.data);
      if (topRes.success) setTopics(topRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuestions = async (customFilters = {}) => {
    try {
      const activeFilters = { ...questionFilters, ...customFilters };
      const res = await api.getQuestions(activeFilters);
      if (res.success) {
        setQuestions(res.data.questions);
        setQuestionsPagination(res.data.pagination);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadExams = async () => {
    try {
      const res = await api.getMockExams();
      if (res.success) setMockExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Student details trigger
  const handleViewUserDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.getAdminUserDetail(id);
      if (res.success) {
        setSelectedUserDetail(res.data);
        setShowUserModal(true);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to load student log files');
    } finally {
      setLoading(false);
    }
  };

  // Student suspension controls
  const handleSuspendUser = async (id: number) => {
    if (window.confirm('Are you sure you want to suspend this student account? They will be locked out of the learning hub.')) {
      try {
        await api.suspendUser(id);
        alert('Student account suspended successfully.');
        loadUsers();
        if (showUserModal) {
          setSelectedUserDetail((prev: any) => ({ ...prev, user: { ...prev.user, status: 'Suspended' } }));
        }
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleActivateUser = async (id: number) => {
    try {
      await api.activateUser(id);
      alert('Student account activated successfully.');
      loadUsers();
      if (showUserModal) {
        setSelectedUserDetail((prev: any) => ({ ...prev, user: { ...prev.user, status: 'Active' } }));
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleChangeMembership = async (id: number, planId: number) => {
    try {
      await api.changeUserMembership(id, planId);
      alert('Student membership tier updated successfully!');
      loadUsers();
      if (showUserModal) {
        const planName = planId === 1 ? 'Free' : planId === 2 ? 'Premium' : 'Advanced';
        setSelectedUserDetail((prev: any) => ({
          ...prev,
          membership: { ...prev.membership, plan_id: planId, plan_name: planName }
        }));
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('DANGER: Delete student account permanently? This will erase all history.')) {
      try {
        await api.deleteAdminUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        setShowUserModal(false);
        alert('Student account deleted.');
        loadStats();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  // Dynamic Pricing Tier Updates
  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({ price: plan.price, description: plan.description });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePlan(editingPlan.id, planForm);
      alert('Plan tier details updated successfully!');
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planForm } : p));
      setShowPlanModal(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // manual CBE/Telebirr approvals
  const handleApprovePayment = async (id: number) => {
    if (window.confirm('Approve payment request and elevate student subscription level?')) {
      try {
        await api.approvePayment(id);
        alert('Payment approved and student promoted successfully!');
        loadPayments();
        loadStats();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleRejectPayment = async (id: number) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    try {
      await api.rejectPayment(id, rejectionReason);
      alert('Payment proof rejected.');
      setShowRejectModal(null);
      setRejectionReason('');
      loadPayments();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Notifications operations
  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      loadStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotifications = async () => {
    if (window.confirm('Delete all notification logs?')) {
      try {
        await api.clearNotifications();
        setNotifications([]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!window.confirm('Delete this subject? This will remove it from the syllabus.')) return;
    try {
      await api.deleteSubject(subjectId);
      await loadSyllabus();
      alert('Subject deleted successfully.');
    } catch (e: any) {
      alert(e.message || 'Failed to delete subject');
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await api.deleteTopic(topicId);
      await loadSyllabus();
      alert('Topic deleted successfully.');
    } catch (e: any) {
      alert(e.message || 'Failed to delete topic');
    }
  };

  // Syllabus save
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: newSubjectName, description: newSubjectDesc, icon: 'BookOpen', color: '#2563eb' };
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, payload);
      } else {
        await api.createSubject(payload);
      }
      loadSyllabus();
      setShowSubjectModal(false);
      alert('Syllabus subject synchronized!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        await api.updateTopic(editingTopic.id, { subject_id: newTopicSubjectId, name: newTopicName });
      } else {
        await api.createTopic({ subject_id: newTopicSubjectId, name: newTopicName });
      }
      loadSyllabus();
      setShowTopicModal(false);
      alert('Syllabus topic synchronized!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Bulk Operations (Checkboxes)
  const toggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (window.confirm(`DANGER: Delete all ${selectedQuestionIds.length} selected questions in bulk?`)) {
      try {
        await api.bulkDeleteQuestions(selectedQuestionIds);
        alert('Bulk deletion successful!');
        setSelectedQuestionIds([]);
        loadQuestions();
        loadStats();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleBulkPlanUpdate = async (planId: number) => {
    if (selectedQuestionIds.length === 0) return;
    try {
      await api.bulkUpdateQuestions(selectedQuestionIds, { plan_id: planId });
      alert(`Bulk upgraded selected questions to Plan ${planId}!`);
      setSelectedQuestionIds([]);
      loadQuestions();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Bulk import via raw text JSON/CSV parsing
  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return;
    try {
      let parsedArray: any[] = [];
      const trimmedText = bulkImportText.trim();
      const fencedMatch = trimmedText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      const jsonCandidate = fencedMatch ? fencedMatch[1].trim() : trimmedText;

      try {
        const parsed = JSON.parse(jsonCandidate);
        parsedArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.questions)
            ? parsed.questions
            : Array.isArray(parsed?.data)
              ? parsed.data
              : Array.isArray(parsed?.items)
                ? parsed.items
                : [];
      } catch {
        // Fallback simple line CSV parser
        const lines = trimmedText.split('\n');
        parsedArray = lines
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            const parts = line.split(',');
            return {
              subject_id: parseInt(parts[0]) || subjects[0]?.id,
              topic_id: parseInt(parts[1]) || topics[0]?.id,
              year: parseInt(parts[2]) || 2016,
              difficulty: parts[3]?.trim() || 'Medium',
              question: parts[4]?.trim() || 'Empty Question text',
              option_a: parts[5]?.trim() || 'A',
              option_b: parts[6]?.trim() || 'B',
              option_c: parts[7]?.trim() || 'C',
              option_d: parts[8]?.trim() || 'D',
              correct_answer: parts[9]?.trim() || 'A',
              explanation: parts[10]?.trim() || '',
              plan_id: bulkPlanId
            };
          });
      }

      if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
        throw new Error('Parsed format is not an array of questions');
      }

      const normalizedQuestions = parsedArray.map((q: any) => {
        const optionsObject = q.options ?? q.choices ?? q.options_obj ?? q.optionsObject;
        const optionA = q.option_a ?? q.optionA ?? q.option1 ?? q.option_1 ?? q.a
          ?? (optionsObject && typeof optionsObject === 'object' && !Array.isArray(optionsObject)
            ? optionsObject.a ?? optionsObject.option_a ?? optionsObject.optionA ?? optionsObject.option1 ?? optionsObject.option_1
            : undefined);
        const optionB = q.option_b ?? q.optionB ?? q.option2 ?? q.option_2 ?? q.b
          ?? (optionsObject && typeof optionsObject === 'object' && !Array.isArray(optionsObject)
            ? optionsObject.b ?? optionsObject.option_b ?? optionsObject.optionB ?? optionsObject.option2 ?? optionsObject.option_2
            : undefined);
        const optionC = q.option_c ?? q.optionC ?? q.option3 ?? q.option_3 ?? q.c
          ?? (optionsObject && typeof optionsObject === 'object' && !Array.isArray(optionsObject)
            ? optionsObject.c ?? optionsObject.option_c ?? optionsObject.optionC ?? optionsObject.option3 ?? optionsObject.option_3
            : undefined);
        const optionD = q.option_d ?? q.optionD ?? q.option4 ?? q.option_4 ?? q.d
          ?? (optionsObject && typeof optionsObject === 'object' && !Array.isArray(optionsObject)
            ? optionsObject.d ?? optionsObject.option_d ?? optionsObject.optionD ?? optionsObject.option4 ?? optionsObject.option_4
            : undefined);

        return {
          ...q,
          subject_id: q.subject_id ?? q.subjectId ?? q.subject ?? q.subject_name ?? '',
          topic_id: q.topic_id ?? q.topicId ?? q.topic ?? q.topic_name ?? '',
          question: q.question ?? q.question_text ?? q.prompt ?? q.statement ?? q.text ?? '',
          option_a: optionA ?? '',
          option_b: optionB ?? '',
          option_c: optionC ?? '',
          option_d: optionD ?? '',
          correct_answer: q.correct_answer ?? q.correctAnswer ?? q.answer ?? q.correct_option ?? q.correctOption ?? '',
          explanation: q.explanation ?? q.explanation_text ?? q.explanationText ?? '',
          reference: q.reference ?? q.reference_text ?? q.referenceText ?? '',
          hint: q.hint ?? q.hint_text ?? q.hintText ?? '',
          estimated_time: q.estimated_time ?? q.estimatedTime ?? q.time ?? 60,
          plan_id: q.plan_id ?? q.planId ?? bulkPlanId,
        };
      });

      await api.importQuestions(normalizedQuestions);
      alert(`Successfully imported ${normalizedQuestions.length} questions in bulk!`);
      setShowImportModal(false);
      setBulkImportText('');
      loadQuestions();
      loadStats();
    } catch (e: any) {
      alert('Import failed! Formatting details: ' + e.message);
    }
  };

  // Single Question save
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...questionForm,
      subject_id: parseInt(questionForm.subject_id),
      topic_id: parseInt(questionForm.topic_id),
      year: parseInt(questionForm.year.toString()),
      plan_id: parseInt(questionForm.plan_id.toString()),
      estimated_time: parseInt(questionForm.estimated_time.toString())
    };

    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, payload);
      } else {
        await api.createQuestion(payload);
      }
      loadQuestions();
      loadStats();
      setShowQuestionModal(false);
      alert('Question committed successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      id: undefined,
      subject_id: subjects[0]?.id?.toString() || '',
      topic_id: topics.filter(t => t.subject_id === subjects[0]?.id)[0]?.id?.toString() || '',
      year: new Date().getFullYear() - 1,
      difficulty: 'Medium',
      plan_id: 1,
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      reference: '',
      hint: '',
      estimated_time: 60
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      id: q.id,
      subject_id: q.subject_id?.toString() || '',
      topic_id: q.topic_id?.toString() || '',
      year: q.year || new Date().getFullYear() - 1,
      difficulty: q.difficulty || 'Medium',
      plan_id: q.plan_id || 1,
      question: q.question || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer || 'A',
      explanation: q.explanation || '',
      reference: q.reference || '',
      hint: q.hint || '',
      estimated_time: q.estimated_time || 60
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this question?')) {
      try {
        await api.deleteQuestion(id);
        alert('Question deleted successfully.');
        loadQuestions();
        loadStats();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResetPasswordId || !newResetPassword) return;
    try {
      await api.resetUserPassword(userResetPasswordId, { password: newResetPassword });
      alert('Password reset successfully!');
      setShowResetPasswordModal(false);
      setNewResetPassword('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="auth-page-container" id="admin-auth-fallback">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div className="auth-icon-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--ethio-red)' }}>🔒</div>
          <h2>System Restricted</h2>
          <p>This panel is exclusively reserved for the national curriculum administrator. Please sign in with an administrator account to continue.</p>
          <button
            onClick={() => {
              // Redirect to main login page
              window.location.hash = '#login';
              const loginBtn = document.getElementById('nav-link-login');
              if (loginBtn) loginBtn.click();
            }}
            className="auth-submit-btn"
            style={{ marginTop: '1.5rem' }}
          >
            Access Login Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container" id="admin-main-dashboard">

      {/* 1. Header with real-time stats */}
      <div className="admin-main-header">
        <div className="admin-welcome-block">
          <span className="operator-badge">🛡️ OPERATOR TERMINAL</span>
          <h2>Ethio Matric Admin Portal</h2>
          <p>Logged in as: <strong>{operatorName}</strong></p>
        </div>
        <div className="admin-actions-block">
          <button
            onClick={() => { loadStats(); loadPayments(); }}
            className="sync-btn"
          >
            <RefreshCw size={16} /> Sync Database
          </button>
          <button
            onClick={() => {
              logout();
            }}
            className="sync-btn logout-btn"
            id="admin-dashboard-logout-btn"
            style={{ background: '#ef4444', color: 'white', border: 'none', marginLeft: '0.75rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="admin-tabs-nav">
        {[
          { id: 'dashboard', label: 'Overview Analytics', icon: <LayoutDashboard size={16} /> },
          { id: 'users', label: 'Student Accounts', icon: <Users size={16} /> },
          { id: 'payments', label: 'Payment Approvals', icon: <FileText size={16} /> },
          { id: 'plans', label: 'Membership Tiers', icon: <Settings size={16} /> },
          { id: 'syllabus', label: 'Subjects & Topics', icon: <BookOpen size={16} /> },
          { id: 'questions', label: 'Question Bank', icon: <Target size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            id={`admin-tab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Tab contents */}
      <div className="admin-tab-content-panel">
        <AnimatePresence mode="wait">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && stats && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="admin-dashboard-grid"
            >
              <div className="grid-4-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span className="stat-label">Total Registered Students</span>
                  <h3 className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.counts?.totalStudents || 0}</h3>
                  <span className="stat-desc text-green">+{stats.counts?.newUsersToday || 0} registered today</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span className="stat-label">Total Questions Pool</span>
                  <h3 className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.counts?.totalQuestions || 0}</h3>
                  <span className="stat-desc">{stats.counts?.totalSubjects || 0} active subjects</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span className="stat-label">Total Approved Revenue</span>
                  <h3 className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--ethio-green)' }}>{paymentStats.totalRevenue || 0} ETB</h3>
                  <span className="stat-desc text-blue">{paymentStats.approvedCount || 0} successful transfers</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span className="stat-label">Pending Verifications</span>
                  <h3 className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--ethio-yellow)' }}>{paymentStats.pendingCount || 0}</h3>
                  <span className="stat-desc">Waiting manual audit</span>
                </div>
              </div>

              {/* Charts and activity list */}
              <div className="dashboard-sub-flex" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                {/* System Alerts */}
                <div className="admin-inner-card">
                  <h4>System Notification Logs</h4>
                  <hr style={{ opacity: 0.1, margin: '0.75rem 0' }} />
                  <div className="notifications-log-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0' }}>No active system alerts.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkNotificationRead(n.id)}
                          className={`system-notif-row ${n.is_read ? 'read' : 'unread'}`}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            borderLeft: n.is_read ? '3px solid var(--border-color)' : '3px solid var(--ethio-red)',
                            background: n.is_read ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>{n.message}</p>
                          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{formatDisplayDate(n.created_at)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subjects performance chart */}
                <div className="admin-inner-card">
                  <h4>National Score Accuracies (%)</h4>
                  <hr style={{ opacity: 0.1, margin: '0.75rem 0' }} />
                  <div style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.subjectPerformance || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="subject_name" stroke="var(--text-secondary)" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="avg_accuracy" fill="#10b981">
                          {(stats.subjectPerformance || []).map((_: any, index: number) => (
                            <Cell key={index} fill={['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: STUDENT ACCOUNTS */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-inner-card"
            >
              <div className="admin-card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h4>Student Database Registry</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Manage profiles, toggle activation states, suspend/activate, or manually update student billing memberships.</p>
                </div>
                <div className="search-box-wrapper" style={{ position: 'relative', width: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search name, school, email..."
                    value={searchUserQuery}
                    onChange={e => setSearchUserQuery(e.target.value)}
                    onKeyUp={e => e.key === 'Enter' && loadUsers()}
                    style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Curriculum Stream</th>
                      <th>School & City</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.first_name} {u.last_name}</strong></td>
                        <td className="font-mono text-xs">{u.email}</td>
                        <td>Grade {u.grade}</td>
                        <td>{u.school || 'Private'} ({u.region || 'Addis Ababa'})</td>
                        <td>
                          <span className={`status-pill ${u.status === 'Suspended' ? 'rejected' : 'approved'}`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeMembership(u.id, 1).then(() => api.updateAdminUser(u.id, { role: e.target.value })).then(loadUsers)}
                            style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <div className="table-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleViewUserDetail(u.id)} className="action-btn-small view-btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                              <Eye size={14} /> View Audit
                            </button>
                            {u.status === 'Suspended' ? (
                              <button onClick={() => handleActivateUser(u.id)} className="action-btn-small" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                Activate
                              </button>
                            ) : (
                              <button onClick={() => handleSuspendUser(u.id)} className="action-btn-small" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                Suspend
                              </button>
                            )}
                            <button onClick={() => handleDeleteUser(u.id)} className="action-btn-small" style={{ background: 'none', border: 'none', color: 'var(--ethio-red)', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PAYMENT APPROVALS */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-inner-card"
            >
              <div className="payments-tab-header" style={{ marginBottom: '1.5rem' }}>
                <h4>CBE Birr & Telebirr Manual Payment Approvals</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Review pending manual wire transfer receipts uploaded by students, cross-reference reference numbers, and approve or reject submissions.</p>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Requested Tier</th>
                      <th>Method</th>
                      <th>Reference Number</th>
                      <th>Status</th>
                      <th>Receipt View</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>No manual billing uploads recorded in database.</td>
                      </tr>
                    ) : (
                      payments.map(p => (
                        <tr key={p.id}>
                          <td>{formatDisplayDate(p.created_at)}</td>
                          <td>
                            <strong>{p.student_name}</strong><br />
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.student_email}</span>
                          </td>
                          <td>
                            <span className={`tier-badge plan-id-${p.plan_id}`}>
                              {p.plan_name}
                            </span>
                          </td>
                          <td>{p.payment_method}</td>
                          <td className="font-mono text-xs" style={{ fontWeight: 'bold' }}>{p.reference_number}</td>
                          <td>
                            <span className={`status-pill ${p.status.toLowerCase()}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            {p.screenshot_url ? (
                              <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ethio-green)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                                View Image Link 🔗
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No image uploaded</span>
                            )}
                          </td>
                          <td>
                            {(String(p.status).toLowerCase() === 'pending') && (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="action-btn-small"
                                  style={{ background: 'var(--ethio-green)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setShowRejectModal(p.id)}
                                  className="action-btn-small"
                                  style={{ background: 'var(--ethio-red)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rejection popup dialog */}
              {showRejectModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                      <h3>Reject Payment Proof</h3>
                      <button onClick={() => setShowRejectModal(null)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleRejectPayment(showRejectModal); }} style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Reason for rejection *</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Transaction Reference does not match Telebirr ledger"
                          style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setShowRejectModal(null)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn" style={{ background: 'var(--ethio-red)' }}>Reject Proof</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: MEMBERSHIP PLANS */}
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-inner-card"
            >
              <div className="plans-tab-header" style={{ marginBottom: '1.5rem' }}>
                <h4>Dynamic Membership Plan Configuration</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Edit active pricing tier values (ETB) and lifetime billing description cards directly visible to student billing dashboards.</p>
              </div>

              <div className="plans-editor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {plans.map(p => (
                  <div key={p.id} className="plan-setup-card" style={{ padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`tier-badge plan-id-${p.id}`}>{p.name.toUpperCase()} TIER</span>
                      <button onClick={() => handleOpenEditPlan(p)} style={{ background: 'none', border: 'none', color: 'var(--ethio-yellow)', cursor: 'pointer' }}>
                        <Edit size={16} /> Edit Plan
                      </button>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.75rem 0' }}>{p.price} ETB</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, minHeight: '40px' }}>{p.description}</p>
                    <hr style={{ opacity: 0.1, margin: '0.75rem 0' }} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Sync state: LIFETIME ENROLLMENT</span>
                  </div>
                ))}
              </div>

              {/* Plan editing Modal */}
              {showPlanModal && editingPlan && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '420px' }}>
                    <div className="modal-header">
                      <h3>Configure Pricing Tier ({editingPlan.name})</h3>
                      <button onClick={() => setShowPlanModal(false)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSavePlan} style={{ marginTop: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Price (ETB) *</label>
                        <input
                          type="number"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({ ...planForm, price: parseInt(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Tier Description / Perks *</label>
                        <textarea
                          value={planForm.description}
                          onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                          style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setShowPlanModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save Pricing Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: SYLLABUS & CURRICULUM */}
          {activeTab === 'syllabus' && (
            <motion.div
              key="syllabus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="syllabus-dashboard-flex"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}
            >
              {/* Subjects Panel */}
              <div className="admin-inner-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4>Active National Subjects</h4>
                  <button onClick={() => { setEditingSubject(null); setNewSubjectName(''); setNewSubjectDesc(''); setShowSubjectModal(true); }} className="add-btn-small" style={{ background: 'var(--ethio-green)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}>
                    <Plus size={14} /> Add Subject
                  </button>
                </div>
                <div className="subject-list-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {subjects.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                      <div>
                        <strong>{s.name}</strong>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>{s.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <button onClick={() => { setEditingSubject(s); setNewSubjectName(s.name); setNewSubjectDesc(s.description); setShowSubjectModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--ethio-yellow)', cursor: 'pointer' }}><Edit size={14} /></button>
                        <button onClick={() => handleDeleteSubject(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete subject"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics Panel */}
              <div className="admin-inner-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4>Curriculum Chapters / Topics</h4>
                  <button onClick={() => { setEditingTopic(null); setNewTopicName(''); setNewTopicSubjectId(subjects[0]?.id || 0); setShowTopicModal(true); }} className="add-btn-small" style={{ background: 'var(--ethio-green)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}>
                    <Plus size={14} /> Add Topic
                  </button>
                </div>
                <div className="topics-list-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {topics.map(t => {
                    const subjectName = subjects.find(s => s.id === t.subject_id)?.name || 'Subject ID: ' + t.subject_id;
                    return (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                        <div>
                          <strong>{t.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5 }}>Under: {subjectName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          <button onClick={() => { setEditingTopic(t); setNewTopicName(t.name); setNewTopicSubjectId(t.subject_id); setShowTopicModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--ethio-yellow)', cursor: 'pointer' }}><Edit size={14} /></button>
                          <button onClick={() => handleDeleteTopic(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete topic"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modals for Syllabus */}
              {showSubjectModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                      <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
                      <button onClick={() => setShowSubjectModal(false)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSaveSubject} style={{ marginTop: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Subject Name *</label>
                        <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Description *</label>
                        <input type="text" value={newSubjectDesc} onChange={e => setNewSubjectDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setShowSubjectModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Sync Subject</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showTopicModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                      <h3>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</h3>
                      <button onClick={() => setShowTopicModal(false)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSaveTopic} style={{ marginTop: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Topic Name *</label>
                        <input type="text" value={newTopicName} onChange={e => setNewTopicName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Linked Subject *</label>
                        <select value={newTopicSubjectId} onChange={e => setNewTopicSubjectId(parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setShowTopicModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Sync Topic</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: QUESTION BANK WITH BULK ACTIONS */}
          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-inner-card"
            >
              <div className="questions-tab-top-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <h4>Interactive Question Bank Pool</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Add single, update existing, or select multiple questions to apply bulk deletions, bulk subscription assignments, or batch JSON imports.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenAddQuestion()} className="sync-btn" style={{ background: 'var(--ethio-green)', color: 'white' }}>
                    <Plus size={16} /> Add Question
                  </button>
                  <button onClick={() => setShowImportModal(true)} className="sync-btn" style={{ background: 'var(--ethio-yellow)', color: 'black' }}>
                    📥 Bulk Import Questions
                  </button>
                </div>
              </div>

              {/* Bulk operations bar */}
              {selectedQuestionIds.length > 0 && (
                <div className="bulk-operations-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--ethio-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Selected: {selectedQuestionIds.length} items</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleBulkDelete} className="action-btn-small" style={{ background: 'var(--ethio-red)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Delete Selected
                    </button>
                    <button onClick={() => handleBulkPlanUpdate(1)} className="action-btn-small" style={{ background: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Set Free
                    </button>
                    <button onClick={() => handleBulkPlanUpdate(2)} className="action-btn-small" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Set Premium
                    </button>
                    <button onClick={() => handleBulkPlanUpdate(3)} className="action-btn-small" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Set Advanced
                    </button>
                  </div>
                  <button onClick={() => setSelectedQuestionIds([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              )}

              {/* Filtering row */}
              <div className="filtering-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select value={questionFilters.subject} onChange={e => setQuestionFilters({ ...questionFilters, subject: e.target.value, page: 1 })} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select value={questionFilters.difficulty} onChange={e => setQuestionFilters({ ...questionFilters, difficulty: e.target.value, page: 1 })} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select value={questionFilters.year} onChange={e => setQuestionFilters({ ...questionFilters, year: e.target.value, page: 1 })} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="">All Years</option>
                  {[2016, 2015, 2014, 2013, 2012, 2011, 2010].map(y => <option key={y} value={y}>{y} E.C.</option>)}
                </select>
              </div>

              {/* Questions database table */}
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={questions.length > 0 && questions.every(q => selectedQuestionIds.includes(q.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const pageIds = questions.map(q => q.id);
                              setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...pageIds])));
                            } else {
                              const pageIds = questions.map(q => q.id);
                              setSelectedQuestionIds(prev => prev.filter(id => !pageIds.includes(id)));
                            }
                          }}
                        />
                      </th>
                      <th>Subject</th>
                      <th>Question Text Preview</th>
                      <th>Year</th>
                      <th>Difficulty</th>
                      <th>Required Tier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => (
                      <tr key={q.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => toggleSelectQuestion(q.id)}
                          />
                        </td>
                        <td><strong>{q.subject_name || q.subject}</strong></td>
                        <td><p style={{ margin: 0, maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</p></td>
                        <td>{q.year} EC</td>
                        <td>{q.difficulty}</td>
                        <td>
                          <span className={`tier-badge plan-id-${q.plan_id || 1}`}>
                            {q.plan_id === 3 ? 'Advanced' : q.plan_id === 2 ? 'Premium' : 'Free'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleOpenEditQuestion(q)} style={{ background: 'none', border: 'none', color: 'var(--ethio-yellow)', cursor: 'pointer' }}><Edit size={14} /></button>
                            <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--ethio-red)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="pagination-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Page {questionsPagination.page} of {questionsPagination.totalPages} (Total {questionsPagination.total} questions)</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={questionFilters.page === 1}
                    onClick={() => setQuestionFilters({ ...questionFilters, page: questionFilters.page - 1 })}
                    className="sync-btn"
                    style={{ padding: '0.3rem 0.7rem' }}
                  >
                    Prev
                  </button>
                  <button
                    disabled={questionFilters.page >= questionsPagination.totalPages}
                    onClick={() => setQuestionFilters({ ...questionFilters, page: questionFilters.page + 1 })}
                    className="sync-btn"
                    style={{ padding: '0.3rem 0.7rem' }}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Question Add/Edit modal */}
              {showQuestionModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="modal-header">
                      <h3>{editingQuestion ? 'Edit Quiz Question' : 'Add Question To Active Curriculum Pool'}</h3>
                      <button onClick={() => setShowQuestionModal(false)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSaveQuestion} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Subject *</label>
                        <select value={questionForm.subject_id} onChange={e => {
                          const subId = parseInt(e.target.value);
                          setQuestionForm({
                            ...questionForm,
                            subject_id: e.target.value,
                            topic_id: topics.filter(t => t.subject_id === subId)[0]?.id?.toString() || ''
                          });
                        }} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Topic / Chapter *</label>
                        <select value={questionForm.topic_id} onChange={e => setQuestionForm({ ...questionForm, topic_id: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          {topics.filter(t => t.subject_id === parseInt(questionForm.subject_id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Matric Year (E.C.) *</label>
                        <input type="number" value={questionForm.year} onChange={e => setQuestionForm({ ...questionForm, year: parseInt(e.target.value) || 2016 })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Difficulty Tier *</label>
                        <select value={questionForm.difficulty} onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Required Subscription Plan *</label>
                        <select value={questionForm.plan_id} onChange={e => setQuestionForm({ ...questionForm, plan_id: parseInt(e.target.value) || 1 })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          <option value={1}>Free Tier</option>
                          <option value={2}>Premium Tier</option>
                          <option value={3}>Advanced Tier</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Question Statement Text *</label>
                        <textarea value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} required style={{ width: '100%', minHeight: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Option A *</label>
                        <input type="text" value={questionForm.option_a} onChange={e => setQuestionForm({ ...questionForm, option_a: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Option B *</label>
                        <input type="text" value={questionForm.option_b} onChange={e => setQuestionForm({ ...questionForm, option_b: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Option C *</label>
                        <input type="text" value={questionForm.option_c} onChange={e => setQuestionForm({ ...questionForm, option_c: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Option D *</label>
                        <input type="text" value={questionForm.option_d} onChange={e => setQuestionForm({ ...questionForm, option_d: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group">
                        <label>Correct Answer Letter *</label>
                        <select value={questionForm.correct_answer} onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} required style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Detailed Explanation Text (Supports Math Notation) *</label>
                        <textarea value={questionForm.explanation} onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })} required style={{ width: '100%', minHeight: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setShowQuestionModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Commit Question</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Bulk JSON Import modal */}
              {showImportModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal" style={{ maxWidth: '520px' }}>
                    <div className="modal-header">
                      <h3>Batch Curriculum Questions Importer</h3>
                      <button onClick={() => setShowImportModal(false)} className="close-modal-btn"><X size={18} /></button>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.5rem' }}>Paste a valid JSON questions array, or comma-separated CSV values. Each item must contain subject, topic, year, difficulty, question statement, options, correct answer, and explanation.</p>

                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Required Subscription Tier for Imported Batch</label>
                        <select value={bulkPlanId} onChange={e => setBulkPlanId(parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          <option value={1}>Free Tier Access</option>
                          <option value={2}>Premium Tier Access</option>
                          <option value={3}>Advanced Tier Access</option>
                        </select>
                      </div>

                      <textarea
                        value={bulkImportText}
                        onChange={(e) => setBulkImportText(e.target.value)}
                        placeholder='[{
                          "subject": "Mathematics",
                          "topic": "Differentiation",
                          "year": 2016,
                          "difficulty": "Medium",
                          "question": "If f(x) = x^2 + 3x, what is f(x)?",
                          "option_a": "2x + 3",
                          "option_b": "x + 3",
                          "option_c": "2x",
                          "option_d": "3x",
                          "correct_answer": "A",
                          "explanation": "Differentiate term by term: derivative of x^2 is 2x and derivative of 3x is 3.",
                          "reference": "Grade 12 Mathematics",
                          "hint": "Use the power rule",
                          "estimated_time": 30
                        }] '
                        style={{ width: '100%', minHeight: '180px', padding: '0.5rem', fontFamily: 'monospace', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => setShowImportModal(false)} className="cancel-btn">Cancel</button>
                        <button onClick={handleBulkImport} className="save-btn" style={{ background: 'var(--ethio-green)' }}>Execute Batch Import</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. Student audit view overlay */}
      {showUserModal && selectedUserDetail && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Detailed Profile Audit Logs ({selectedUserDetail.user.first_name})</h3>
              <button onClick={() => setShowUserModal(false)} className="close-modal-btn"><X size={18} /></button>
            </div>

            <div className="user-audit-body" style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Personal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Full Name</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 'bold' }}>{selectedUserDetail.user.first_name} {selectedUserDetail.user.last_name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Email Address</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 'bold' }}>{selectedUserDetail.user.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Phone Number</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 'bold' }}>{selectedUserDetail.user.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Active Subscription Plan</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 'bold' }}>
                    <span className={`tier-badge plan-id-${selectedUserDetail.membership?.plan_id || 1}`} style={{ marginLeft: 0 }}>
                      {selectedUserDetail.membership?.plan_name?.toUpperCase() || 'FREE'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Modify Subscription Tier */}
              <div className="audit-sub-section">
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Manually override student subscription tier</h5>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleChangeMembership(selectedUserDetail.user.id, 1)} className="action-btn-small" style={{ border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>Free Tier</button>
                  <button onClick={() => handleChangeMembership(selectedUserDetail.user.id, 2)} className="action-btn-small" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>Premium (100 ETB)</button>
                  <button onClick={() => handleChangeMembership(selectedUserDetail.user.id, 3)} className="action-btn-small" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>Advanced (500 ETB)</button>
                </div>
              </div>

              {/* Login history logs */}
              <div className="audit-sub-section">
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Student Login History Logs</h5>
                <div className="log-list" style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-primary)', borderRadius: '6px', padding: '0.5rem' }}>
                  {selectedUserDetail.login_history?.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No logins recorded yet</span>
                  ) : (
                    selectedUserDetail.login_history?.map((log: any) => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                        <span>IP: {log.ip_address} ({log.user_agent?.substring(0, 45)}...)</span>
                        <span style={{ opacity: 0.5 }}>{formatDisplayDate(log.login_time)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Learning stats progress summary */}
              <div className="audit-sub-section">
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Student Answer Progress Metrics</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>XP Accumulated</span>
                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--ethio-green)' }}>{selectedUserDetail.progress?.xp || 0}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Answered Correctly</span>
                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--ethio-green)' }}>{selectedUserDetail.progress?.correctAnswersCount || 0}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Wrong Tries</span>
                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--ethio-red)' }}>{selectedUserDetail.progress?.wrongAnswersCount || 0}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => setShowUserModal(false)} className="cancel-btn">Close Audit</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
