import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, StudyPlanTask } from '../types';
import { QUESTIONS } from '../data/questions';
import { translations, Language } from '../utils/translations';

interface AppContextType {
  theme: 'light' | 'dark';
  soundOn: boolean;
  activePage: string;
  progress: UserProgress;
  toggleTheme: () => void;
  toggleSound: () => void;
  setActivePage: (page: string) => void;
  answerQuestion: (questionId: number, isCorrect: boolean) => void;
  toggleFavorite: (questionId: number) => void;
  saveNote: (questionId: number, noteText: string) => void;
  togglePlannerTask: (taskId: string) => void;
  addXP: (amount: number) => void;
  playCorrectSound: () => void;
  playIncorrectSound: () => void;
  triggerConfetti: () => void;
  showConfetti: boolean;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  resetProgress: () => void;

  // Real API Authentication & Language & Payments
  user: any | null;
  token: string | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  login: (email: string, password: string) => Promise<any>;
  signup: (signupData: any) => Promise<any>;
  logout: () => void;
  isLocked: (requiredPlanId?: number) => boolean;
  membershipPlan: any | null;
  submitPayment: (planId: number, method: string, ref: string, screenshotUrl?: string) => Promise<any>;
  paymentHistory: any[];
  loadPaymentHistory: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<any>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PLANNER_TASKS: StudyPlanTask[] = [
  { id: '1', day: 'Monday', task: 'Practice Calculus Limits & Continuity', subject: 'Mathematics', completed: false },
  { id: '2', day: 'Tuesday', task: 'Review Newton\'s Rotational Dynamics', subject: 'Physics', completed: false },
  { id: '3', day: 'Wednesday', task: 'Learn first-order Kinetics and rate constant', subject: 'Chemistry', completed: false },
  { id: '4', day: 'Thursday', task: 'Read Mendel\'s Laws of Inheritance', subject: 'Biology', completed: false },
  { id: '5', day: 'Friday', task: 'Practice Type 3 Conditionals', subject: 'English', completed: false },
  { id: '6', day: 'Saturday', task: 'Take a Full Mock Exam', subject: 'Mock Exam', completed: false },
  { id: '7', day: 'Sunday', task: 'Review marked weak subjects and notes', subject: 'Revision', completed: false },
];

const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyXp: 0,
  dailyGoal: 50,
  completedQuestionIds: [],
  correctAnswersCount: 0,
  wrongAnswersCount: 0,
  favorites: [],
  subjectProgress: {},
  notes: {},
  studyPlanner: DEFAULT_PLANNER_TASKS,
  unlockedBadges: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);

  // Real Auth States
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<any | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [language, setLanguageState] = useState<Language>('en');

  // Load state from LocalStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ethio_theme') as 'light' | 'dark' | null;
    let activeTheme: 'light' | 'dark' = 'light';
    if (savedTheme) {
      activeTheme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('ethio_theme', activeTheme);
    }
    setTheme(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);

    const savedSound = localStorage.getItem('ethio_sound');
    if (savedSound !== null) {
      setSoundOn(savedSound === 'true');
    }

    const savedLang = localStorage.getItem('ethio_lang') as Language | null;
    if (savedLang) {
      setLanguageState(savedLang);
    }

    const savedToken = localStorage.getItem('ethio_token');
    const savedUser = localStorage.getItem('ethio_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        if (u.role) localStorage.setItem('ethio_role', u.role);
        if (u.first_name) localStorage.setItem('ethio_user_name', `${u.first_name} ${u.last_name || ''}`.trim());
      } catch (e) {
        console.error(e);
      }
    }

    const savedProgress = localStorage.getItem('ethio_progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) as UserProgress;
        const todayStr = new Date().toISOString().split('T')[0];
        const lastDate = parsed.lastActiveDate;
        let currentStreak = parsed.streak;

        if (lastDate && lastDate !== todayStr) {
          const lastActive = new Date(lastDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak += 1;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }

          parsed.streak = currentStreak;
          parsed.lastActiveDate = todayStr;
          parsed.dailyXp = 0;
        }

        setProgress(parsed);
      } catch (e) {
        console.error('Error loading progress', e);
      }
    }
  }, []);

  // Save progress dynamically
  useEffect(() => {
    if (progress !== INITIAL_PROGRESS) {
      localStorage.setItem('ethio_progress', JSON.stringify(progress));
    }
  }, [progress]);

  // Load membership when user or token changes, and poll to unlock contents automatically
  useEffect(() => {
    if (token && user) {
      loadMembership();

      const intervalId = setInterval(() => {
        loadMembership();
      }, 5000); // Poll every 5s to catch admin approval automatically

      return () => clearInterval(intervalId);
    } else {
      setMembershipPlan(null);
    }
  }, [token, user]);

  const loadMembership = async () => {
    try {
      const data = await apiFetch('/api/payments/history');
      if (data.success) {
        setMembershipPlan(data.data.membership || { plan_id: 1, plan_name: 'Free' });
        setPaymentHistory(data.data.history || []);
      }
    } catch (e) {
      console.warn('Failed to load real membership status, using offline Free plan', e);
      setMembershipPlan({ plan_id: 1, plan_name: 'Free' });
    }
  };

  // Helper API fetch with auth token
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Read fresh token from localStorage if state is stale
    const activeToken = token || localStorage.getItem('ethio_token');
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const res = await fetch(endpoint, { ...options, headers });
    const resData = await res.json().catch(() => ({ success: false, message: 'Server returned an invalid response.' }));
    if (!res.ok) {
      throw new Error(resData?.message || 'Server request failed');
    }
    return resData;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ethio_theme', newTheme);
  };

  const toggleSound = () => {
    const newSound = !soundOn;
    setSoundOn(newSound);
    localStorage.setItem('ethio_sound', String(newSound));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ethio_lang', lang);
  };

  // Safe Translate dictionary function
  const t = (key: string): string => {
    const dict = translations[language] as any;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English dictionary
    const engDict = translations['en'] as any;
    if (engDict && engDict[key]) {
      return engDict[key];
    }
    return key;
  };

  // Authenticate user login
  const login = async (email: string, password: string): Promise<any> => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.success && data.data) {
        const { token: userToken, user: userData } = data.data;
        const safeUser = userData && typeof userData === 'object' ? userData : null;

        setToken(userToken || null);
        setUser(safeUser);
        if (userToken) {
          localStorage.setItem('ethio_token', userToken);
        } else {
          localStorage.removeItem('ethio_token');
        }

        if (safeUser) {
          localStorage.setItem('ethio_user', JSON.stringify(safeUser));
          if (safeUser.role) localStorage.setItem('ethio_role', safeUser.role);
          localStorage.setItem('ethio_user_name', `${safeUser.first_name || ''} ${safeUser.last_name || ''}`.trim());
        } else {
          localStorage.removeItem('ethio_user');
          localStorage.removeItem('ethio_role');
          localStorage.removeItem('ethio_user_name');
        }
        return data;
      }
      throw new Error(data.message || 'Login failed');
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  // Register user account
  const signup = async (signupData: any): Promise<any> => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          grade: parseInt(signupData.grade || '12'),
          school: signupData.school || '',
          region: signupData.region || '',
          phone_number: signupData.phone || '',
        }),
      });

      // Auto-login on successful signup if backend returns token/user
      if (data?.success && data?.data) {
        const { token: userToken, user: userData } = data.data;
        const safeUser = userData && typeof userData === 'object' ? userData : null;

        if (!safeUser || !userToken) {
          throw new Error('Registration succeeded but the server did not return a valid session.');
        }

        setToken(userToken || null);
        setUser(safeUser);

        if (userToken) localStorage.setItem('ethio_token', userToken);
        if (safeUser) {
          localStorage.setItem('ethio_user', JSON.stringify(safeUser));
          if (safeUser.role) localStorage.setItem('ethio_role', safeUser.role);
          localStorage.setItem('ethio_user_name', `${safeUser.first_name || ''} ${safeUser.last_name || ''}`.trim());
        }
      }

      return data;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMembershipPlan(null);
    localStorage.removeItem('ethio_token');
    localStorage.removeItem('ethio_user');
    localStorage.removeItem('ethio_role');
    localStorage.removeItem('ethio_user_name');
    setActivePage('login');
  };

  // Update profile
  const updateUserProfile = async (data: any): Promise<any> => {
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (updated.success && updated.data) {
        const freshUser = { ...user, ...updated.data };
        setUser(freshUser);
        localStorage.setItem('ethio_user', JSON.stringify(freshUser));
        localStorage.setItem('ethio_user_name', `${freshUser.first_name || ''} ${freshUser.last_name || ''}`.trim());
      }
      return updated;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Access control checker: Checks if a subject/topic of specific tier is locked for current user
  const isLocked = (requiredPlanId?: number): boolean => {
    if (!requiredPlanId || requiredPlanId === 1) return false; // Free content is never locked
    if (user?.role === 'admin') return false; // Admin has complete access

    // Fetch active level (1 = Free, 2 = Premium, 3 = Advanced)
    const currentPlanId = membershipPlan?.plan_id || 1;
    return currentPlanId < requiredPlanId;
  };

  // Student manual payment submission
  const submitPayment = async (planId: number, method: string, ref: string, screenshotUrl?: string): Promise<any> => {
    try {
      const data = await apiFetch('/api/payments/requests', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: planId,
          payment_method: method,
          reference_number: ref,
          screenshot_url: screenshotUrl || '',
        }),
      });
      await loadMembership(); // Refresh to catch pending request
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const loadPaymentHistory = async () => {
    await loadMembership();
  };

  // Web Audio synth
  const playSound = (freqs: number[], durations: number[], type: OscillatorType = 'sine') => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      let time = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gainNode.gain.setValueAtTime(0.1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + durations[idx]);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + durations[idx]);
        time += durations[idx] * 0.8;
      });
    } catch (e) {
      console.warn('Audio Context error: ', e);
    }
  };

  const playCorrectSound = () => {
    playSound([523.25, 659.25], [0.15, 0.25]);
  };

  const playIncorrectSound = () => {
    playSound([220, 180], [0.2, 0.2], 'sawtooth');
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const addXP = (amount: number) => {
    setProgress((prev) => {
      const newXp = prev.xp + amount;
      const newDailyXp = prev.dailyXp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newlyUnlockedBadges = [...prev.unlockedBadges];

      if (newXp >= 1000 && !newlyUnlockedBadges.includes('xp_warrior')) {
        newlyUnlockedBadges.push('xp_warrior');
      }

      if (prev.streak >= 3 && !newlyUnlockedBadges.includes('streak_3')) {
        newlyUnlockedBadges.push('streak_3');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        dailyXp: newDailyXp,
        unlockedBadges: newlyUnlockedBadges,
      };
    });
  };

  const answerQuestion = (questionId: number, isCorrect: boolean) => {
    const q = QUESTIONS.find((item) => item.id === questionId);
    if (!q) return;

    setProgress((prev) => {
      const completedIds = prev.completedQuestionIds.includes(questionId)
        ? prev.completedQuestionIds
        : [...prev.completedQuestionIds, questionId];

      const corrects = isCorrect ? prev.correctAnswersCount + 1 : prev.correctAnswersCount;
      const wrongs = !isCorrect ? prev.wrongAnswersCount + 1 : prev.wrongAnswersCount;

      const subjectName = q.subject;
      const currentSubProgress = prev.subjectProgress[subjectName] || { answered: 0, correct: 0 };
      const newlyAnswered = prev.completedQuestionIds.includes(questionId) ? 0 : 1;
      const newlyCorrect = isCorrect && !prev.completedQuestionIds.includes(questionId) ? 1 : 0;

      const updatedSubProgress = {
        ...prev.subjectProgress,
        [subjectName]: {
          answered: currentSubProgress.answered + newlyAnswered,
          correct: currentSubProgress.correct + newlyCorrect,
        },
      };

      const xpEarned = isCorrect ? 10 : 2;
      const newXp = prev.xp + xpEarned;
      const newDailyXp = prev.dailyXp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;

      const newlyUnlockedBadges = [...prev.unlockedBadges];

      if (isCorrect && !newlyUnlockedBadges.includes('first_steps')) {
        newlyUnlockedBadges.push('first_steps');
      }
      if (corrects >= 10 && !newlyUnlockedBadges.includes('perfect_10')) {
        newlyUnlockedBadges.push('perfect_10');
      }

      const totalSubjectQuestions = QUESTIONS.filter((qi) => qi.subject === subjectName).length;
      if (updatedSubProgress[subjectName].answered >= totalSubjectQuestions && !newlyUnlockedBadges.includes('subject_master')) {
        newlyUnlockedBadges.push('subject_master');
      }

      if (newXp >= 1000 && !newlyUnlockedBadges.includes('xp_warrior')) {
        newlyUnlockedBadges.push('xp_warrior');
      }

      return {
        ...prev,
        completedQuestionIds: completedIds,
        correctAnswersCount: corrects,
        wrongAnswersCount: wrongs,
        subjectProgress: updatedSubProgress,
        xp: newXp,
        level: newLevel,
        dailyXp: newDailyXp,
        unlockedBadges: newlyUnlockedBadges,
      };
    });
  };

  const toggleFavorite = (questionId: number) => {
    setProgress((prev) => {
      const isFav = prev.favorites.includes(questionId);
      const newFavs = isFav
        ? prev.favorites.filter((id) => id !== questionId)
        : [...prev.favorites, questionId];
      return {
        ...prev,
        favorites: newFavs,
      };
    });
  };

  const saveNote = (questionId: number, noteText: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [questionId]: noteText,
      },
    }));
  };

  const togglePlannerTask = (taskId: string) => {
    setProgress((prev) => {
      const updatedPlanner = prev.studyPlanner.map((t) => {
        if (t.id === taskId) {
          if (!t.completed) addXP(15);
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      return {
        ...prev,
        studyPlanner: updatedPlanner,
      };
    });
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress, XP, and streaks? This cannot be undone.')) {
      setProgress(INITIAL_PROGRESS);
      localStorage.removeItem('ethio_progress');
      alert('Progress has been reset.');
      setActivePage('home');
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        soundOn,
        activePage,
        progress,
        toggleTheme,
        toggleSound,
        setActivePage,
        answerQuestion,
        toggleFavorite,
        saveNote,
        togglePlannerTask,
        addXP,
        playCorrectSound,
        playIncorrectSound,
        triggerConfetti,
        showConfetti,
        selectedSubject,
        setSelectedSubject,
        resetProgress,

        // Real API Authentication & Language & Payments
        user,
        token,
        language,
        setLanguage,
        t,
        login,
        signup,
        logout,
        isLocked,
        membershipPlan,
        submitPayment,
        paymentHistory,
        loadPaymentHistory,
        updateUserProfile,
        apiFetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
