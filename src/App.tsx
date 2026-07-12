import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { getCatalogQuestionCount } from './lib/questionPool';
import { SubjectsPage } from './pages/SubjectsPage';
import { PracticePage } from './pages/PracticePage';
import { MockExamPage } from './pages/MockExamPage';
import { DashboardPage } from './pages/DashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PlannerPage } from './pages/PlannerPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { MembershipPage } from './pages/MembershipPage';
import {
  SubjectDetailPage,
  SocialSubjectPage,
  SubjectYearPracticePage,
  SocialYearPracticePage,
} from './pages/SubjectFlowPages';
import { LockedContent } from './components/exam/LockedContent';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, Home, BookOpen, Target, Award, BookOpenCheck,
  Calendar, Bookmark, Settings, Flame, Zap, Sparkles, Shield,
  User, LogIn, UserPlus, LogOut, Globe, Sun, Moon,
  Facebook, Instagram, Linkedin, Github, Send, Mail, Phone, Clock,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const PAGE_PATHS: Record<string, string> = {
  home: '/',
  subjects: '/subjects',
  practice: '/practice',
  mock: '/mock-exams',
  progress: '/progress',
  favorites: '/favorites',
  planner: '/planner',
  membership: '/membership',
  flashcards: '/flashcards',
  admin: '/admin',
  login: '/login',
  signup: '/signup',
  profile: '/profile',
  'forgot-password': '/forgot-password',
  settings: '/settings',
};

const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page])
);

const ProtectedPremiumRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLocked, setActivePage } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLocked(2)) {
    return (
      <LockedContent
        onPayNow={() => {
          setActivePage('membership');
          navigate('/membership');
        }}
      />
    );
  }

  return <>{children}</>;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const {
    activePage,
    setActivePage,
    progress,
    theme,
    toggleTheme,
    showConfetti,
    user,
    logout,
    language,
    setLanguage,
    t
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarNavRef = useRef<HTMLDivElement | null>(null);
  const [indicatorTop, setIndicatorTop] = useState<number>(0);
  const [indicatorVisible, setIndicatorVisible] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  useEffect(() => {
    getCatalogQuestionCount().then(setTotalQuestionsCount);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const completedQuestionsCount = progress.completedQuestionIds.length;
  const overallPercent = totalQuestionsCount > 0
    ? Math.round((completedQuestionsCount / totalQuestionsCount) * 100)
    : 0;

  // Construct dynamic list of sidebar items based on login status and role
  const getNavItems = () => {
    const items = [
      { id: 'home', label: language === 'am' ? 'ዋና ገጽ' : 'Home', icon: <Home size={18} /> },
      { id: 'subjects', label: language === 'am' ? 'የትምህርት አይነቶች' : 'Subjects', icon: <BookOpen size={18} /> },
      { id: 'practice', label: t('practice'), icon: <Target size={18} /> },
      { id: 'mock', label: t('mockExams'), icon: <Award size={18} />, badge: '600s' },
      { id: 'favorites', label: t('bookmarked'), icon: <Bookmark size={18} /> },
      { id: 'planner', label: t('planner'), icon: <Calendar size={18} /> },
      { id: 'membership', label: language === 'am' ? 'ፕሪሚየም ዕቅዶች' : 'Membership Plans', icon: <Sparkles size={18} />, badge: '🔥' },
    ];

    if (user) {
      items.push({ id: 'progress', label: t('dashboard'), icon: <Sparkles size={18} /> });
      items.push({ id: 'profile', label: t('profile'), icon: <User size={18} /> });

      if (user.role === 'admin') {
        items.push({ id: 'admin', label: t('admin'), icon: <Shield size={18} /> });
      }
    } else {
      items.push({ id: 'login', label: t('login'), icon: <LogIn size={18} /> });
      items.push({ id: 'signup', label: t('signup'), icon: <UserPlus size={18} /> });
    }

    items.push({ id: 'settings', label: t('settings'), icon: <Settings size={18} /> });
    return items;
  };

  // Derive the active page purely from the URL — no side-effect setState needed
  const currentPage = PATH_TO_PAGE[location.pathname] || 'home';

  // Render active page component
  const renderRoutes = () => (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/subjects" element={<SubjectsPage />} />
      <Route path="/subjects/social/:subSubject" element={<SocialSubjectPage />} />
      <Route path="/subjects/:slug" element={<SubjectDetailPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/practice/:slug/:year" element={<SubjectYearPracticePage />} />
      <Route path="/social/:subSubject/:year" element={<SocialYearPracticePage />} />
      <Route path="/previous-exams" element={<SubjectsPage />} />
      <Route path="/previous-exams/:slug/:year" element={<SubjectYearPracticePage />} />
      <Route
        path="/mock-exams"
        element={
          <ProtectedPremiumRoute>
            <MockExamPage />
          </ProtectedPremiumRoute>
        }
      />
      <Route path="/mock-exams/:id" element={<ProtectedPremiumRoute><MockExamPage /></ProtectedPremiumRoute>} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/progress" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
      <Route path="/planner" element={<PrivateRoute><PlannerPage /></PrivateRoute>} />
      <Route path="/flashcards" element={<PrivateRoute><FlashcardsPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/progress'} replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/progress" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );

  const handleNavClick = (id: string) => {
    const path = PAGE_PATHS[id] || '/';
    navigate(path);
    setMobileSidebarOpen(false);
  };

  // Position the animated horizontal active indicator
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.getElementById(`nav-link-${currentPage}`);
      const container = sidebarNavRef.current;
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const top = elRect.top - containerRect.top + (elRect.height / 2) - 3;
        setIndicatorTop(top);
        setIndicatorVisible(true);
      } else {
        setIndicatorVisible(false);
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [currentPage, mobileSidebarOpen]);

  // Generate confetti pieces
  const renderConfetti = () => {
    if (!showConfetti) return null;
    const pieces = Array.from({ length: 50 });
    return (
      <div className="confetti-overlay" id="confetti-overlay-parent">
        {pieces.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 2;
          const color = ['var(--ethio-green)', 'var(--ethio-yellow)', 'var(--ethio-red)', '#2563eb', '#a855f7'][Math.floor(Math.random() * 5)];

          return (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                backgroundColor: color,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={theme}>

      {/* Confetti Rain */}
      {renderConfetti()}

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          className="menu-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle navigation menu"
          id="mobile-nav-toggle-btn"
        >
          {mobileSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
        <div className="brand-section" style={{ marginBottom: 0 }}>
          <div className="brand-logo">
            <div className="brand-logo-inner">
              <span style={{ fontSize: '0.7rem' }}>🇪🇹</span>
            </div>
          </div>
          <span className="brand-name">Ethio Matric Prep</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="theme-toggle-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={toggleTheme}
            id="mobile-theme-toggle-btn"
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? <Sun size={16} className="theme-icon-sun" /> : <Moon size={16} className="theme-icon-moon" />}
          </button>

          <div className="mobile-lang-selector" style={{ marginRight: '0.5rem' }}>
            <button
              className="lang-toggle-btn-small"
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              id="mobile-lang-toggle"
            >
              <Globe size={18} />
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar (Desktop + Drawer on Mobile) */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} id="navigation-sidebar-container">

        {/* Language Selector Header Widget */}
        <div className="sidebar-lang-selector">
          <span className="lang-label"><Globe size={14} /> Language / ቋንቋ:</span>
          <div className="lang-buttons-row">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              id="sidebar-lang-en-btn"
            >
              English
            </button>
            <button
              className={`lang-btn ${language === 'am' ? 'active' : ''}`}
              onClick={() => setLanguage('am')}
              id="sidebar-lang-am-btn"
            >
              አማርኛ
            </button>
          </div>
        </div>

        <div className="brand-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', justifyContent: 'space-between', display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div className="brand-logo" style={{ flexShrink: 0 }}>
              <div className="brand-logo-inner">
                <span style={{ fontSize: '0.8rem' }}>🇪🇹</span>
              </div>
            </div>
            {!isCollapsed && <span className="brand-name">Ethio Matric Prep</span>}
          </div>
          <button
            onClick={toggleSidebarCollapse}
            className="sidebar-collapse-toggle-btn"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            id="sidebar-collapse-toggle"
            style={{ flexShrink: 0 }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav" ref={sidebarNavRef}>
          <div
            className="sidebar-indicator"
            style={{ top: `${indicatorTop}px`, opacity: indicatorVisible ? 1 : 0 }}
            aria-hidden="true"
          />
          {getNavItems().map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              id={`nav-link-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}

          {user && (
            <button
              className="nav-link logout-nav-link"
              onClick={() => {
                logout();
                navigate('/login');
                setMobileSidebarOpen(false);
              }}
              id="nav-link-logout"
              style={{ marginTop: 'auto', color: 'var(--ethio-red)', opacity: 0.85 }}
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          )}
        </nav>

        {/* Live Level & XP Widget at the base of the sidebar */}
        <div className="sidebar-user-card" id="user-progress-widget-sidebar">
          <div className="user-card-header">
            <span className="user-avatar">⭐</span>
            <div className="user-info">
              <h4>Level {progress.level} Scholar</h4>
              <p>{progress.xp} Total XP</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
              <Flame size={14} style={{ color: 'var(--ethio-red)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{progress.streak}d</span>
            </div>
          </div>
          <div className="sidebar-xp-bar">
            <div className="sidebar-xp-fill" style={{ width: `${progress.xp % 100}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">

        {/* Desktop Header Bar */}
        <header className="main-header-bar">
          <div className="main-header-left">
            <span className="welcome-text">
              {user
                ? `${language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome back'}, ${user.first_name}! 👋`
                : `${language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome back, Scholar'}! 👋`}
            </span>
            <span className="welcome-subtext">
              {language === 'am'
                ? 'የኢትዮጵያን ማትሪክ ዝግጅትዎን ዛሬ ለማጠናቀቅ ዝግጁ ነዎት?'
                : 'Ready to master your Ethiopian Matric preparation today?'}
            </span>
          </div>
          <div className="main-header-right">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="desktop-theme-toggle-btn"
              aria-label="Toggle theme layout"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {theme === 'dark' ? <Sun size={20} className="theme-icon-sun" /> : <Moon size={20} className="theme-icon-moon" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <div className="online-pill">
              <span className="pulse-dot"></span>
              <span>4,291 students active</span>
            </div>
            <div className="user-profile-circle" onClick={() => handleNavClick(user ? 'profile' : 'login')} style={{ cursor: 'pointer' }}>
              {user ? '👤' : '⭐'}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            id="main-animated-content-wrapper"
          >
            {renderRoutes()}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Progress Ribbon Footer */}
        <div className="progress-toast-footer">
          <div className="progress-toast-left">
            <span>Matric Prep Stable Build v2.4.0</span>
            <div className="progress-toast-divider"></div>
            <span>National Syllabus Syncing</span>
          </div>
          <div className="progress-toast-right">
            <span className="progress-toast-text">Overall Course Progress: {overallPercent}%</span>
            <div className="progress-toast-bar-bg">
              <div className="progress-toast-bar-fill" style={{ width: `${overallPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Overhauled Premium Footer */}
        <footer className="enhanced-site-footer">
          <div className="footer-top-grid">
            {/* About Column */}
            <div className="footer-col about-col">
              <div className="brand-section" style={{ padding: 0, marginBottom: '1.25rem' }}>
                <div className="brand-logo">
                  <div className="brand-logo-inner">
                    <span style={{ fontSize: '0.8rem' }}>🇪🇹</span>
                  </div>
                </div>
                <span className="brand-name">Ethio Matric Prep</span>
              </div>
              <p className="footer-about-text">
                This platform helps Ethiopian Grade 12 students prepare effectively for the National Matric Examination through structured learning resources, mock examinations, and progress tracking. Aligned with the latest Ministry of Education syllabus.
              </p>
              <div className="social-links-row">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn facebook" aria-label="Facebook"><Facebook size={18} /></a>
                <a href="https://telegram.org" target="_blank" rel="noreferrer" className="social-icon-btn telegram" aria-label="Telegram"><Send size={18} /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn instagram" aria-label="Instagram"><Instagram size={18} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn linkedin" aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn github" aria-label="GitHub"><Github size={18} /></a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="footer-col links-col">
              <h4>Quick Links</h4>
              <ul className="footer-links-list">
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('home')}>Home</button></li>
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('subjects')}>Subjects</button></li>
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('mock')}>Mock Exams</button></li>
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('progress')}>Dashboard / Stats</button></li>
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('planner')}>Study Planner</button></li>
                <li><button style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleNavClick('settings')}>System Settings</button></li>
              </ul>
            </div>

            {/* Contact Support Column */}
            <div className="footer-col contact-col">
              <h4>Contact Support</h4>
              <ul className="footer-contact-list">
                <li>
                  <Mail size={16} className="contact-icon text-green-500" />
                  <a href="mailto:support@ethiomatricprep.com">support@ethiomatricprep.com</a>
                </li>
                <li>
                  <Phone size={16} className="contact-icon text-yellow-500" />
                  <a href="tel:+251955123456">+251 955 123 456</a>
                </li>
                <li>
                  <Clock size={16} className="contact-icon text-red-500" />
                  <span>Mon - Sat, 8:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="footer-col newsletter-col">
              <h4>Stay Updated</h4>
              <p>Receive notifications for syllabus updates, exams, and keys notes directly.</p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to our newsletter!'); }} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter email address"
                  required
                  className="newsletter-input"
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className="btn btn-primary newsletter-submit-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="animated-divider">
            <div className="divider-glow-line"></div>
          </div>

          <div className="footer-bottom-row">
            <p className="copyright-text">
              © {new Date().getFullYear()} Ethio Matric Prep. Crafted in alignment with MoE Grade 12 National Curriculum.
            </p>
            <div className="footer-policy-links">
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleNavClick('settings')}>Privacy Policy</button>
              <span className="bullet-dot">•</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleNavClick('settings')}>Terms</button>
              <span className="bullet-dot">•</span>
              <span className="syllabus-stamp">Syllabus v1.2</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
