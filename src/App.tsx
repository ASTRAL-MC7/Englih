import React, { useState, useEffect } from 'react';
import { CATEGORIES, INITIAL_WORDS } from './data/dictionary';
import { generateFullProceduralDictionary } from './data/procedural';
import { WordItem, CategoryInfo } from './types';
import { WordCard } from './components/WordCard';
import { QuizSection } from './components/QuizSection';
import { AIPractice } from './components/AIPractice';
import { AIGenerator } from './components/AIGenerator';
import { LeaderboardSection } from './components/LeaderboardSection';
import { 
  BookOpen, 
  HelpCircle, 
  MessageSquareCode, 
  Search, 
  Sparkles, 
  Star, 
  Info, 
  SlidersHorizontal,
  ChevronRight,
  GraduationCap,
  Globe,
  PlusCircle,
  Menu,
  X,
  RefreshCw,
  Library,
  Sun,
  Moon,
  ArrowUpRight,
  Trophy,
  Eye,
  EyeOff,
  User,
  Lock,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Dark/Light Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('helpful_english_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Dedicated user session state, synchronizes with localStorage
  const [currentUser, setCurrentUser] = useState<{ username: string; score: number } | null>(() => {
    try {
      const saved = localStorage.getItem('helpful_english_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Entry loading splash screen state - forced to display if no active logged-in user
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const savedUser = localStorage.getItem('helpful_english_user');
      const savedSplash = sessionStorage.getItem('helpful_english_splash_dismissed');
      return !savedUser || savedSplash !== 'true';
    } catch {
      return true;
    }
  });

  // Auth form inputs
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [isAuthRequestPending, setIsAuthRequestPending] = useState(false);

  // Animated post-login transition loading state
  const [isLoggingInLoading, setIsLoggingInLoading] = useState(false);
  const [loginLoadingStep, setLoginLoadingStep] = useState(0);

  const triggerPostLoginAnimation = (user: any) => {
    setIsLoggingInLoading(true);
    setLoginLoadingStep(0);
    const interval = setInterval(() => {
      setLoginLoadingStep((prev) => prev + 1);
    }, 800);
    setTimeout(() => {
      clearInterval(interval);
      setCurrentUser(user);
      localStorage.setItem('helpful_english_user', JSON.stringify(user));
      sessionStorage.setItem('helpful_english_splash_dismissed', 'true');
      setShowSplash(false);
      setIsLoggingInLoading(false);
    }, 2400);
  };

  // Sync theme status to body class element
  useEffect(() => {
    try {
      localStorage.setItem('helpful_english_theme', theme);
    } catch (e) {}

    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light');
      body.classList.remove('dark');
      body.style.backgroundColor = '#faf8f5';
    } else {
      body.classList.add('dark');
      body.classList.remove('light');
      body.style.backgroundColor = '#0b0f17';
    }
  }, [theme]);

  // Application Vocabulary Data state
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [words, setWords] = useState<WordItem[]>(() => generateFullProceduralDictionary());

  // Filter / Exploration state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterMode, setFilterMode] = useState<'all' | 'ai-only' | 'bookmarked'>('all');
  const [activeTab, setActiveTab] = useState<'dictionary' | 'quiz' | 'tutor' | 'leaderboard'>('dictionary');

  // Bookmarking persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('helpful_english_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Mobile drawer panel logic
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRefreshWords = async () => {
    try {
      const response = await fetch('/api/words');
      if (response.ok) {
        const data = await response.json();
        if (data.words) {
          setWords(data.words);
        }
      }
    } catch (err) {
      console.warn("Express server yet not fully online. Proceeding with static vocabulary state.", err);
    }
  };

  // Fetch compiled entries from local server on mount to resume previous session additions if any
  useEffect(() => {
    handleRefreshWords();
  }, []);

  // Save bookmarks state locally
  useEffect(() => {
    localStorage.setItem('helpful_english_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Handle Bookmarking toggles
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  // Callback after AI generator successfully appends words
  const handleNewItemsGenerated = (newItems: WordItem[]) => {
    setWords(prev => {
      const merged = [...prev];
      newItems.forEach(item => {
        if (!merged.some(m => m.word.toLowerCase() === item.word.toLowerCase())) {
          merged.push(item);
        }
      });
      return merged;
    });
  };

  // Reset dictionary
  const handleResetToDefault = async () => {
    if (confirm("Rostdan ham barcha keyingi yuklangan AI so'zlarini tozalab, tizimni dastlabki holatiga qaytarmoqchimisiz?")) {
      try {
        const response = await fetch('/api/words/reset', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          setWords(INITIAL_WORDS);
          setBookmarkedIds([]);
        }
      } catch (err) {
        setWords(INITIAL_WORDS);
        setBookmarkedIds([]);
        console.error("Resetting server dictionary failed:", err);
      }
    }
  };

  // Filter words based on chosen category, search parameters, and bookmark toggles
  const filteredWords = words.filter(word => {
    // 1. Category check
    if (selectedCategory !== "all" && word.category !== selectedCategory) {
      return false;
    }

    // 2. Filter mode check
    if (filterMode === 'ai-only' && !word.isAiGenerated) {
      return false;
    }
    if (filterMode === 'bookmarked' && !bookmarkedIds.includes(word.id)) {
      return false;
    }

    // 3. Search query check
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchWord = word.word.toLowerCase().includes(query);
      const matchDef = word.definition.toLowerCase().includes(query);
      const matchTrans = word.translation.toLowerCase().includes(query);
      const matchAlt = word.ratherThan?.toLowerCase().includes(query) || false;
      return matchWord || matchDef || matchTrans || matchAlt;
    }

    return true;
  });

  // Calculate metrics per category for statistics & goals
  const activeCategoryObject = categories.find(c => c.id === selectedCategory);
  const activeCategoryWordsCount = words.filter(w => w.category === selectedCategory).length;

  return (
    <div className={`min-h-screen font-sans antialiased pb-28 md:pb-16 transition-colors duration-500 selection:bg-cyan-500/30 selection:text-cyan-200 ${
      theme === 'dark' 
        ? 'text-slate-100 bg-[#0b0f17]' 
        : 'text-slate-800 bg-[#faf8f5]'
    }`}>
      
      {/* BY VAELUX EMBEDDED IMMERSIVE ENTRY SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            id="vaelux-entry-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
              theme === 'dark' ? 'bg-[#06080d]' : 'bg-[#f4f1ea]'
            }`}
          >
            {/* Ambient vector shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full animate-pulse" />
              <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[140px] rounded-full" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className={`w-full max-w-lg p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border text-center relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-slate-900/80 border-slate-800/80' 
                  : 'bg-white/95 border-[#e3dfd5] shadow-[#eae5d9]'
              }`}
            >
              {/* Gold light shine */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              {isLoggingInLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 border-r-indigo-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <motion.h3 
                    key={loginLoadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm md:text-base font-bold font-display tracking-tight mb-2 min-h-[48px] px-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {loginLoadingStep === 0 && "Idrokbek darsliklari va eko-tizim yuklanmoqda..."}
                    {loginLoadingStep === 1 && "Sizning shaxsiy IELTS portfolioingiz faollashtirilmoqda..."}
                    {loginLoadingStep >= 2 && "Tizim tayyor! Sayohat boshlanmoqda... 🚀"}
                  </motion.h3>
                  
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-4 font-mono">
                    Biz bilan IELTS 8+ yuqori cho'qqilarini zabt eting.
                  </p>

                  {/* Progressive Loading bar */}
                  <div className="w-40 h-1 bg-slate-800/60 rounded-full overflow-hidden mt-2">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: loginLoadingStep === 0 ? "35%" : loginLoadingStep === 1 ? "70%" : "100%" }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Shimmering Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 uppercase mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Platinum Edition 2026
                  </span>

                  {/* BRAND: BY VAELUX WITH EXQUISITE LINK REDIRECT */}
                  <div 
                    id="vaelux-brand-trigger"
                    onClick={() => {
                      window.open("https://t.me/vaelux", "_blank");
                    }}
                    className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] inline-block mb-6 relative overflow-hidden ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-850 hover:border-cyan-500/30' 
                        : 'bg-slate-50 border-[#e3dfd5] hover:border-[#0d9488]/30'
                    }`}
                    title="Open Telegram Channel t.me/vaelux"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/5 to-cyan-505/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.25em] mb-1">DESIGNED & DELIVERED</span>
                    <span className="block text-3xl md:text-4xl font-extrabold font-display leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 drop-shadow-sm">
                      BY VAELUX
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-400 mt-2 opacity-80 group-hover:opacity-100 group-hover:underline transition-all">
                      t.me/vaelux <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* SLOGAN */}
                  <h2 className={`text-xl md:text-2xl font-bold font-display tracking-tight leading-snug mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-950'
                  }`}>
                    "Elevate Your Voice, Command the Room"
                  </h2>

                  <p className={`text-xs md:text-sm leading-relaxed mb-6 max-w-sm mx-auto ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Unlocking English native fluency, vocabulary shortcuts, street talk, texting abbreviations, and orchestrating your path to a proud IELTS 8+ band score.
                  </p>

                  {/* AUTHENTICATION FORM FIELDS */}
                  <div className="space-y-4 mb-6 text-left">
                    {authErrorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-505/20 text-xs text-red-450 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                        {authErrorMessage}
                      </div>
                    )}

                    <div>
                      <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Foydalanuvchi nomi (Username)
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Masalan: musoxon"
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-slate-950/80 border border-slate-800 text-white focus:border-cyan-500/60'
                              : 'bg-slate-100/80 border border-[#e3dfd5] text-slate-800 focus:border-cyan-500/60'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Maxfiy parol (Password)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className={`w-full pl-11 pr-12 py-3 rounded-xl text-sm font-semibold outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-slate-950/80 border border-slate-800 text-white focus:border-cyan-500/60'
                              : 'bg-slate-100/80 border border-[#e3dfd5] text-slate-800 focus:border-cyan-500/60'
                          }`}
                        />
                        {/* VISIBLE AND INVISIBLE PASSWORD TOGGLE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer select-none p-1"
                        >
                          {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ENTER BUTTON */}
                  <button
                    id="splash-enter-btn"
                    disabled={isAuthRequestPending}
                    onClick={async () => {
                      if (!authUsername.trim() || !authPassword.trim()) {
                        setAuthErrorMessage("Iltimos, foydalanuvchi nomi va parolni kiriting!");
                        return;
                      }
                      setIsAuthRequestPending(true);
                      setAuthErrorMessage('');
                      try {
                        const response = await fetch('/api/auth/login-register', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            username: authUsername,
                            password: authPassword
                          })
                        });

                        const data = await response.json();
                        if (response.ok && data.success) {
                          triggerPostLoginAnimation(data.user);
                        } else {
                          setAuthErrorMessage(data.message || "Akkountga kirishda xatolik.");
                        }
                      } catch (e) {
                        setAuthErrorMessage("Serverga ulanishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
                      } finally {
                        setIsAuthRequestPending(false);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl cursor-pointer bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/10 hover:opacity-95 active:scale-[0.99] transition-all"
                  >
                    <span>{isAuthRequestPending ? "TIZIMGA KIRISH/RO'YXATDAN O'TISH..." : "SOHAGA KIRISH (ENTER)"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* GUEST ACCESS OPTION */}
                  <button
                    id="splash-guest-btn"
                    type="button"
                    onClick={() => {
                      const uniqueGuestNum = Math.floor(1000 + Math.random() * 9000);
                      const guestUser = { username: `Mehmon_${uniqueGuestNum}`, score: 0 };
                      triggerPostLoginAnimation(guestUser);
                    }}
                    className={`w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl cursor-pointer font-bold text-xs transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <span>MEHMON BO'LIB KIRISH (GUEST ENTER)</span>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow ambient background graphics */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* TOP HEADER PANELS */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#0b0f17]/85 border-b border-slate-850/80' 
          : 'bg-[#faf8f5]/85 border-[#e3dfd5]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className={`text-lg md:text-xl font-bold font-display tracking-tight flex items-center gap-1.5 leading-none ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Helpful English <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">IELTS 8+</span>
              </h1>
              <p className={`text-[11px] mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Zamonaviy English Iboralar va Slanglar Lug'ati
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <span className={`text-[10px] uppercase font-mono tracking-wider font-bold block ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>JAMI LUG‘AT:</span>
              <span className="text-sm font-bold text-cyan-300 font-display">{words.length} ta ibora</span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] uppercase font-mono tracking-wider font-bold block ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>SAQLANGANLAR:</span>
              <span className="text-sm font-bold text-amber-300 font-display flex items-center justify-end gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300" fill="currentColor" />
                {bookmarkedIds.length} ta
              </span>
            </div>
          </div>

          {/* Theme switcher & Navigation Tabs */}
          <div className="flex items-center gap-3">
            <button
              id="theme-toggle"
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                theme === 'dark' 
                  ? 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/90 text-slate-400 hover:text-cyan-300' 
                  : 'border-[#e3dfd5] bg-white hover:bg-slate-100 text-slate-500 hover:text-indigo-600 shadow-sm'
              }`}
              title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-500" />
              )}
            </button>

            {/* Tabs Triggers for Navigation */}
            <div className={`hidden md:flex items-center p-1 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-[#e3dfd5] shadow-sm'
            }`}>
              <button
                id="tab-explorer-btn"
                onClick={() => setActiveTab('dictionary')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'dictionary'
                    ? 'bg-[#182030] text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lug'at</span>
              </button>
              <button
                id="tab-quiz-btn"
                onClick={() => setActiveTab('quiz')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-[#182030] text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Smart Quiz</span>
              </button>
              <button
                id="tab-leaderboard-btn"
                onClick={() => setActiveTab('leaderboard')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-[#182030] text-cyan-303 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rankings</span>
              </button>
              <button
                id="tab-practice-btn"
                onClick={() => setActiveTab('tutor')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'tutor'
                    ? 'bg-[#182030] text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Idrokbek Coach</span>
              </button>
            </div>

            {/* Logged in User widget */}
            {currentUser && (
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 shrink-0">
                <span className="px-2 text-[10px] font-mono font-bold text-cyan-400 max-w-[85px] sm:max-w-none truncate">
                  ⚡ {currentUser.username}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('helpful_english_user');
                    setCurrentUser(null);
                    setShowSplash(true);
                  }}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-550/20 text-red-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Akkountdan chiqish"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Chiqish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 lg:py-8">
        
        {/* Welcome Pitch Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-950/40 border border-slate-850/80 backdrop-blur-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-450/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> BECOOL IN ENGLISH
            </span>
            <h2 className="text-2xl md:text-3.5xl font-extrabold font-display text-white tracking-tight leading-tight">
              Ingliz tilida native'dek gapiring va <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">IELTS 8+ ball</span> egallang!
            </h2>
            <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed max-w-xl">
              Ushbu interaktiv platformada o'ta foydali slenglar, transition so'zlar, qisqartmalar va muqobil iboralarni AI (Gemini) bilan to'liq 200 tagacha kengaytirib o'rganing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[120px]">
              <span className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1">Katogoriyalar:</span>
              <span className="text-2xl font-bold font-display text-white">9 ta</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[120px]">
              <span className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-1">Mavjud so'zlar:</span>
              <span className="text-2xl font-bold font-display text-cyan-300">{words.length} ta</span>
            </div>
          </div>
        </div>

        {/* THREE PANEL ACTIVE TAB DISPLAY AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* SIDEBAR: Category Picklist Selector */}
          {activeTab !== 'leaderboard' && (
            <div className="lg:col-span-1 space-y-4">
            
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">KATEGORIYALAR</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Category Listing Buttons */}
              <div id="category-selector-list" className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 scrollbar-none">
                {/* 'All' button */}
                <button
                  id="category-all-btn"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === "all"
                      ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/30 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">🌍</span>
                  <div className="flex-1 text-left">
                    <span className="block font-bold">Barchasi</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 hidden lg:block" />
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const countInCat = words.filter(w => w.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      id={`category-btn-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-450 to-indigo-550 border-cyan-400/20 text-white shadow-md'
                          : 'bg-slate-950/30 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <div className="flex-1 text-left min-w-0">
                        <span className="block font-bold truncate">{cat.name}</span>
                        <span className={`text-[10px] block truncate font-mono ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`}>
                          {countInCat} ta element
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 hidden lg:block" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Generator metrics block inside sidebar if category selected is a valid id */}
            {selectedCategory !== "all" && (
              <AIGenerator
                currentCount={activeCategoryWordsCount}
                categoryUrl={selectedCategory}
                categoryName={activeCategoryObject?.name || ""}
                words={words}
                onItemsGenerated={handleNewItemsGenerated}
                onResetToDefault={handleResetToDefault}
              />
            )}

            {/* Idrokbek's IELTS Score Booster advice box */}
            <div className="p-5 rounded-3xl bg-slate-900/30 border border-slate-805 border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Idrokbek IELTS Maslahatlari</span>
              </div>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-350">
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-400 shrink-0 font-bold">1.</span>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Oddiy so'zlardan qoching:</span>
                    "Very sad" o'rniga "despondent", "very happy" o'rniga "ecstatic" kabi sinonimlarni qo'llab, yuqori lexical resource ko'rsatkichi oling.
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-400 shrink-0 font-bold">2.</span>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Metodik Talaffuz:</span>
                    Audio belgisini bosib, har bir so'zning asl talaffuzini eshiting va so'z burchaklaridagi ritmlarni birga takrorlang.
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-sky-450 text-indigo-400 shrink-0 font-bold">3.</span>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Idrokbek Muloqot Rejimi:</span>
                    Idrokbek Coach bo'limiga o'tib, bugun o'rgangan yangi sleng va frazalaringizni ishtirok etgan jumlalarda yozib mashq qiling.
                  </div>
                </li>
              </ul>
            </div>
          </div>
          )}

          {/* MAIN COLUMN VIEWPORTS */}
          <div className={activeTab === 'leaderboard' ? "lg:col-span-4" : "lg:col-span-3"}>
            
            {activeTab === 'quiz' && (
              <QuizSection 
                words={words} 
                selectedCategoryName={activeCategoryObject?.name || "Barchasi"} 
                selectedCategoryUrl={selectedCategory} 
                currentUser={currentUser}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardSection 
                currentUser={currentUser} 
                onRefreshWords={handleRefreshWords} 
              />
            )}

            {activeTab === 'tutor' && (
              <AIPractice 
                words={filteredWords} 
                selectedCategoryName={activeCategoryObject?.name || "Barchasi"} 
              />
            )}

            {activeTab === 'dictionary' && (
              <div className="space-y-6">
                
                {/* Search & Mode Selector Panel */}
                <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col md:flex-row items-center gap-4">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="dictionary-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`${activeCategoryObject ? activeCategoryObject.name : "Zamin so'zlari"} bo‘limidan qidirish... (Uzbekcha/Inglizcha)`}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/40 focus:bg-slate-950/80 border border-slate-850 focus:border-cyan-500 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/25 transition-all text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Smart filter Mode selects */}
                  <div className="flex bg-slate-950 border border-slate-855 rounded-2xl p-1 shrink-0 w-full md:w-auto">
                    <button
                      id="filter-all"
                      onClick={() => setFilterMode('all')}
                      className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        filterMode === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Barchasi
                    </button>
                    <button
                      id="filter-ai"
                      onClick={() => setFilterMode('ai-only')}
                      className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        filterMode === 'ai-only'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Chipli
                    </button>
                    <button
                      id="filter-bookmarks"
                      onClick={() => setFilterMode('bookmarked')}
                      className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        filterMode === 'bookmarked'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      Yulduzchalar
                    </button>
                  </div>
                </div>

                {/* Info and detail banner for the active selected category */}
                <div className="p-5 rounded-3xl bg-[#131c2c]/40 border border-blue-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl p-1 bg-sky-500/5 rounded-xl">
                      {activeCategoryObject?.emoji || "🌍"}
                    </div>
                    <div>
                      <h3 className="font-bold font-display text-white">
                        {activeCategoryObject?.name || "Barcha bo‘limlar"}
                      </h3>
                      <p className="text-xs text-sky-200">
                        {activeCategoryObject?.descriptionUz || "Ingliz tilidagi eng chiroyli va mashhur narsalar to‘plami."}
                      </p>
                      <p className="text-[11px] text-slate-400 italic">
                        {activeCategoryObject?.descriptionEng || "Curated list of high-scoring elements."}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 shrink-0">
                    Natijalar: {filteredWords.length} ta element
                  </div>
                </div>

                {/* Dictionary Grid of Cards */}
                {filteredWords.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredWords.map((word) => (
                      <WordCard
                        key={word.id}
                        item={word}
                        isBookmarked={bookmarkedIds.includes(word.id)}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-16 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl text-center bg-slate-950/20">
                    <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
                    <h3 className="text-lg font-bold font-display text-white">Hech narsa topilmadi</h3>
                    <p className="text-sm text-slate-400 max-w-sm mt-1">
                      Kechirasiz, tanlangan filtr yoki qidiruv bo'yicha hech qanday ibora topilmadi. Qidiruv so'zini boshqacha yozib ko'ring yoki boshqa bo'limga o'ting.
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer credits */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-16 md:pb-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p className="font-display font-medium text-slate-400 mb-1">Helpful English Platform</p>
        <p className="mb-2">A luxury English speaking workbook for modern IELTS 8+ aspiring scholars. Built with React, Express and Gemini AI.</p>
        <p>© 2026 Helpful English. All rights are managed in your local browser sandbox.</p>
      </footer>

      {/* MOBILE PREMIUM BOTTOM NAVIGATION BAR */}
      {!showSplash && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur-lg transition-colors duration-300 px-2 py-2 flex justify-around items-center shadow-2xl ${
          theme === 'dark' 
            ? 'bg-[#0a0e16]/95 border-slate-850/80 text-slate-200' 
            : 'bg-white/95 border-slate-200 text-slate-700'
        }`}>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'dictionary'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Library className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold font-sans tracking-tight">Lug'at</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold font-sans tracking-tight">Smart Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold font-sans tracking-tight">Rankings</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'tutor'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <MessageSquareCode className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold font-sans tracking-tight">Idrokbek</span>
          </button>
        </div>
      )}
    </div>
  );
}
