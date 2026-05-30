import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Sparkles, RefreshCw, User, HelpCircle, Flame, CheckCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserScore {
  username: string;
  score: number;
  solvedQuizzesCount: number;
}

interface LeaderboardSectionProps {
  currentUser: { username: string; score: number } | null;
  onRefreshWords: () => void;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ currentUser, onRefreshWords }) => {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<{
    topUsers: UserScore[];
    userRank: number;
    userScore: number;
    totalUsers: number;
  } | null>(null);

  // AI Discoverer state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<string>('');
  const [selectedDiscoveryCategory, setSelectedDiscoveryCategory] = useState('idioms');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const usernameParam = currentUser ? `?username=${encodeURIComponent(currentUser.username)}` : '';
      const response = await fetch(`/api/leaderboard${usernameParam}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error("Leaderboard yuklash xatosi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser]);

  // AI discovery action
  const handleAiDiscovery = async () => {
    setIsDiscovering(true);
    setDiscoverResult('');
    try {
      const response = await fetch('/api/gemini/generate-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedDiscoveryCategory,
          existingWords: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.newItems) {
          setDiscoverResult(`AI muvaffaqiyatli ravishda '${selectedDiscoveryCategory}' bo'limiga ${data.newItems.length} ta mutlaqo yangi va premium iboralar topib, umumiy bazaga qo'shdi!`);
          onRefreshWords(); // update words in App state
        } else {
          setDiscoverResult("Xatolik: Baza yangilana olmadi.");
        }
      } else {
        const data = await response.json();
        setDiscoverResult(`Xato: ${data.error || 'Ulanishda xatolik'}`);
      }
    } catch (err) {
      setDiscoverResult("Serverga ulanishda xatolik yuz berdi.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const getPodiumColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-405 via-amber-400 to-yellow-500 shadow-amber-500/20'; // gold
      case 1: return 'from-slate-300 via-slate-100 to-slate-400 shadow-slate-300/20'; // silver
      case 2: return 'from-amber-700 via-orange-605 to-amber-900 shadow-orange-900/20'; // bronze
      default: return 'from-slate-800 to-slate-900';
    }
  };

  const top3 = leaderboardData?.topUsers.slice(0, 3) || [];
  const runners = leaderboardData?.topUsers.slice(3) || [];

  // Rearrange top 3 for professional podium display: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ user: top3[1], index: 1 }); // 2nd
  if (top3[0]) podiumOrder.push({ user: top3[0], index: 0 }); // 1st
  if (top3[2]) podiumOrder.push({ user: top3[2], index: 2 }); // 3rd

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER BANNER */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-950/40 border border-slate-850/80 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 blur-3xl pointer-events-none" />
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-400/10 text-amber-400 border border-amber-450/20 mb-3">
            <Trophy className="w-3.5 h-3.5" /> PLATINUM LEADERBOARD
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
            IELTS Scholars Leaderboard
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
            Tizimdagi eng kuchli o'quvchilar reytingi. Smart Quiz savollariga to'g'ri javob topib balingizni oshiring va do'stlar orasida o'rningizni mustahkamlang!
          </p>
        </div>

        <button 
          onClick={fetchLeaderboard}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEADERBOARD VIEW (7 columns) */}
        <div id="leaderboard-panel" className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md relative">
            <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce" /> Unikal Top 3 va Reyting
            </h3>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
                Reyting ma'lumotlari yuklanmoqda...
              </div>
            ) : leaderboardData && leaderboardData.topUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm">Hozircha o'yinchilar mavjud emas. Birinchi bo'lib ro'yxatdan o'ting!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. OZGACHA DIZAYNDAGI TOP 3 PODIUM */}
                <div className="flex justify-center items-end gap-2 md:gap-4 pt-10 pb-6 border-b border-slate-850/60">
                  {/* Map over podium list (2nd, 1st, 3rd) */}
                  {podiumOrder.map(({ user, index }) => {
                    const place = index + 1;
                    const heightClass = place === 1 ? 'h-36 sm:h-44 bg-gradient-to-t from-amber-600/20 to-yellow-500/10 border-yellow-500/40' : place === 2 ? 'h-28 sm:h-34 bg-gradient-to-t from-slate-800/40 to-slate-700/10 border-slate-700/40' : 'h-24 sm:h-28 bg-gradient-to-t from-amber-900/20 to-orange-800/10 border-amber-900/30';
                    const scaleClass = place === 1 ? 'scale-110 -translate-y-2 z-10' : 'scale-100';

                    return (
                      <motion.div
                        key={user.username}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`flex flex-col items-center w-[23%] min-w-[76px] sm:w-32 text-center relative ${scaleClass}`}
                      >
                        {/* Avatar/Rank Icon Header */}
                        <div className="relative mb-2">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${getPodiumColor(index)} flex items-center justify-center text-white border-2 border-slate-900 shadow-xl font-bold font-display text-lg relative`}>
                            {place === 1 ? (
                              <Crown className="w-6 h-6 text-yellow-300 absolute -top-5 drop-shadow-lg" />
                            ) : (
                              <span className="text-xs font-mono font-bold opacity-80">#{place}</span>
                            )}
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                        </div>

                        {/* Podium Block */}
                        <div className={`w-full rounded-2xl border ${heightClass} flex flex-col justify-end p-2.5 sm:p-4 shadow-lg backdrop-blur-sm`}>
                          <span className="block font-bold text-xs sm:text-sm text-white truncate max-w-full">
                            {user.username}
                          </span>
                          <span className="block text-[10px] sm:text-xs font-mono text-cyan-400 mt-1 font-semibold">
                            🏆 {user.score} ball
                          </span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                            {user.solvedQuizzesCount} ta quiz
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 2. RUNNERS LIST (Rankings 4 and below) */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {runners.map((user, idx) => {
                    const absoluteRank = idx + 4;
                    const isCurrentUser = currentUser && user.username.toLowerCase() === currentUser.username.toLowerCase();

                    return (
                      <div
                        key={user.username}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isCurrentUser 
                            ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200 shadow-lg' 
                            : 'bg-slate-950/30 border-slate-850/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold w-6 text-slate-500 text-center">
                            #{absoluteRank}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 border border-slate-755 flex items-center justify-center font-display text-xs font-bold font-semibold uppercase">
                            {user.username.slice(0, 2)}
                          </div>
                          <span className="font-semibold text-sm sm:text-base text-white truncate max-w-[150px] sm:max-w-[200px]">
                            {user.username} {isCurrentUser && <span className="text-[9px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 px-1.5 py-0.5 rounded-full ml-1">Siz</span>}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-sm text-cyan-300 font-mono">{user.score} ball</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{user.solvedQuizzesCount} ta challenge</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. CURRENT USER'S INDIVIDUAL POSITION BLOCK (Sizning o'rningiz) */}
                {currentUser && leaderboardData && (
                  <div className="mt-8 p-5 rounded-3xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent border border-cyan-500/30 backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-950/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-xl rounded-full" />
                    
                    <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-mono leading-none tracking-widest font-black uppercase text-cyan-400/80">RANK</span>
                        <span className="text-xl font-bold font-display mt-0.5">#{leaderboardData.userRank}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">Sizning joriy o'rningiz: #{leaderboardData.userRank}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Tizimdagi jami {leaderboardData.totalUsers} ta faol foydalanuvchi ichidagi nufuzli reytingingiz.
                        </p>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="block text-[10px] font-mono uppercase text-slate-400">JAMGARILGAN BAL</span>
                      <span className="text-xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">{leaderboardData.userScore} ball</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI ONLINE WORD DISCOVERY GENERATOR (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-550/5 blur-2xl" />
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-400/20 uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI-Powered Database Expander
            </span>

            <h3 className="text-lg font-bold font-display text-white mb-2">
              Yangi so'zlar kashf etish (AI)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Ushbu bo'lim Gemini sun'iy intellekti yordamida IELTS 8+ darajasidagi yangi inglizcha slenglar va iboralar topib, umumiy ma'lumotlar bazasini doimiy ravishda boyitib boradi!
            </p>

            {/* Category selection */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Kashf etish yo'nalishi:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'idioms', name: 'Idiomalar' },
                    { id: 'slangs', name: 'Ko\'cha Slenglari' },
                    { id: 'instead_of', name: 'Muqobil So\'zlar' },
                    { id: 'fillers', name: 'Filler So\'zlar' },
                    { id: 'texting', name: 'Qisqartmalar' },
                    { id: 'phrasal_verbs', name: 'Phrasal Verbs' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedDiscoveryCategory(cat.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
                        selectedDiscoveryCategory === cat.id
                          ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300 font-bold'
                          : 'bg-slate-950/40 hover:bg-slate-950/80 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Discover Trigger Button */}
            <button
              onClick={handleAiDiscovery}
              disabled={isDiscovering}
              className={`w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl cursor-pointer font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 transition-all shadow-lg active:scale-98 ${
                isDiscovering ? 'opacity-80' : 'hover:opacity-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isDiscovering ? 'animate-pulse' : ''}`} />
              <span>{isDiscovering ? "AI BAZANI YANGILAMOQDA..." : "YANGI SO'ZLAR TOPISH VA QO'SHISH (AI)"}</span>
            </button>

            {/* Discovery feedback screen */}
            <AnimatePresence>
              {discoverResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 p-4.5 rounded-2xl bg-slate-950/80 border border-slate-850"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">AI YANGILANISHI HISOBOTI</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {discoverResult}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
