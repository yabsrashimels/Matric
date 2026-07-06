import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { QUESTIONS } from './data/questions';
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
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Home, BookOpen, Target, Award, BookOpenCheck, 
  Calendar, Bookmark, Settings, Flame, Zap, Sparkles, Shield,
  User, LogIn, UserPlus, LogOut, Globe
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    progress, 
    theme, 
    showConfetti, 
    user, 
    logout, 
    language, 
    setLanguage, 
    t 
  } = useApp();
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarNavRef = useRef<HTMLDivElement | null>(null);
  const [indicatorTop, setIndicatorTop] = useState<number>(0);
  const [indicatorVisible, setIndicatorVisible] = useState<boolean>(false);

  const totalQuestionsCount = QUESTIONS.length;
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

  // Render active page component
  const renderPage = () => {
    // Private page protection: redirect unauthenticated users to Login
    const privatePages = ['progress', 'favorites', 'planner', 'flashcards', 'profile', 'admin'];
    if (!user && privatePages.includes(activePage)) {
      return <LoginPage />;
    }

    // Authenticated page protection: redirect logged in users away from auth pages
    const authPages = ['login', 'signup', 'forgot-password'];
    if (user && authPages.includes(activePage)) {
      return user.role === 'admin' ? <AdminPage /> : <DashboardPage />;
    }

    switch (activePage) {
      case 'home': return <HomePage />;
      case 'subjects': return <SubjectsPage />;
      case 'practice': return <PracticePage />;
      case 'mock': return <MockExamPage />;
      case 'progress': return <DashboardPage />;
      case 'favorites': return <FavoritesPage />;
      case 'planner': return <PlannerPage />;
      case 'membership': return <MembershipPage />;
      case 'flashcards': return <FlashcardsPage />;
      case 'admin': return user?.role === 'admin' ? <AdminPage /> : <HomePage />;
      case 'login': return <LoginPage />;
      case 'signup': return <SignupPage />;
      case 'profile': return <ProfilePage />;
      case 'forgot-password': return <ForgotPasswordPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setMobileSidebarOpen(false);
  };

  // Position the animated horizontal active indicator
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.getElementById(`nav-link-${activePage}`);
      const container = sidebarNavRef.current;
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const top = elRect.top - containerRect.top + (elRect.height / 2) - 3; // center align (indicator height ~6px)
        setIndicatorTop(top);
        setIndicatorVisible(true);
      } else {
        setIndicatorVisible(false);
      }
    };

    // update initially and on resize
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activePage, mobileSidebarOpen]);

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
    <div className="app-container" data-theme={theme}>
      
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
      </header>

      {/* Navigation Sidebar (Desktop + Drawer on Mobile) */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`} id="navigation-sidebar-container">
        
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

        <div className="brand-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
          <div className="brand-logo">
            <div className="brand-logo-inner">
              <span style={{ fontSize: '0.8rem' }}>🇪🇹</span>
            </div>
          </div>
          <span className="brand-name">Ethio Matric Prep</span>
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
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
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
            <div className="online-pill">
              <span className="pulse-dot"></span>
              <span>4,291 students active</span>
            </div>
            <div className="user-profile-circle" onClick={() => setActivePage(user ? 'profile' : 'login')} style={{ cursor: 'pointer' }}>
              {user ? '👤' : '⭐'}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            id="main-animated-content-wrapper"
          >
            {renderPage()}
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

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-links">
            <button className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleNavClick('home')}>About Portal</button>
            <a href="mailto:support@ethiomatricprep.com" className="footer-link">Contact Support</a>
            <button className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleNavClick('settings')}>Privacy Policies</button>
            <span className="footer-link">Syllabus v1.2</span>
          </div>
          <p className="footer-copyright">
            © 2026 Ethio Matric Prep. Crafted aligned with the Ministry of Education Grade 12 National Curriculum of Ethiopia.
          </p>
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
