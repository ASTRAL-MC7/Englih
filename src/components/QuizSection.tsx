import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { Sparkles, ArrowRight, RefreshCw, Trophy, AlertCircle, CheckCircle, Calendar, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizSectionProps {
  words: WordItem[];
  selectedCategoryName: string;
  selectedCategoryUrl: string;
  currentUser: { username: string; score: number } | null;
}

interface QuestionDetails {
  word: WordItem;
  options: string[];
  correctIndex: number;
  questionType: 'definition' | 'translation';
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  words,
  selectedCategoryName,
  selectedCategoryUrl,
  currentUser
}) => {
  // Modes: 'daily' (stable 5 daily questions) or 'practice' (infinite on the fly)
  const [quizMode, setQuizMode] = useState<'daily' | 'practice'>('daily');
  const [dailyPool, setDailyPool] = useState<WordItem[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Core quiz engine states
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDetails | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  
  // Daily specific progression
  const [dailyIndex, setDailyIndex] = useState<number>(0);
  const [dailyQuestionsList, setDailyQuestionsList] = useState<QuestionDetails[]>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmettedMsg, setScoreSubmittedMsg] = useState("");
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch stable 5 daily pool on mount or mode switch
  const fetchDailyQuestions = async () => {
    setLoadingDaily(true);
    setScoreSubmittedMsg("");
    try {
      const response = await fetch('/api/quiz/daily');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.questions) {
          setDailyPool(data.questions);
          generateDailyQuestionsList(data.questions);
        }
      }
    } catch (err) {
      console.error("Daily quiz fetch error:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  useEffect(() => {
    if (quizMode === 'daily') {
      fetchDailyQuestions();
    } else {
      resetQuizEngine();
    }
  }, [quizMode, words]);

  // Generate 5 stable questions for today's dynamic words
  const generateDailyQuestionsList = (dailyWords: WordItem[]) => {
    if (dailyWords.length < 3) return;

    const generated: QuestionDetails[] = [];
    
    for (let i = 0; i < dailyWords.length; i++) {
      const targetWord = dailyWords[i];
      const questionType = i % 2 === 0 ? 'definition' : 'translation';

      // Pick incorrect answer choices from global words list
      const incorrectOptions: string[] = [];
      const tempPool = words.filter(w => w.id !== targetWord.id && w.category === targetWord.category);
      const fallbackPool = words.filter(w => w.id !== targetWord.id);
      const poolToUse = tempPool.length >= 3 ? tempPool : fallbackPool;

      while (incorrectOptions.length < 3 && poolToUse.length > 0) {
        const idx = Math.floor(Math.random() * poolToUse.length);
        const chosenWord = poolToUse.splice(idx, 1)[0];
        const optionText = questionType === 'definition' ? chosenWord.definition : chosenWord.translation;
        if (!incorrectOptions.includes(optionText) && optionText !== (questionType === 'definition' ? targetWord.definition : targetWord.translation)) {
          incorrectOptions.push(optionText);
        }
      }

      // Safeguard options sizes
      while (incorrectOptions.length < 3) {
        incorrectOptions.push("Boring standard answer choice alternative");
      }

      const correctAnswerText = questionType === 'definition' ? targetWord.definition : targetWord.translation;
      const options = [...incorrectOptions];
      const correctPos = Math.floor(Math.random() * 4);
      options.splice(correctPos, 0, correctAnswerText);

      generated.push({
        word: targetWord,
        options,
        correctIndex: correctPos,
        questionType
      });
    }

    setDailyQuestionsList(generated);
    setDailyIndex(0);
    setScore(0);
    setTotalQuestions(0);
    setQuizFinished(false);
    
    if (generated.length > 0) {
      setCurrentQuestion(generated[0]);
    }
  };

  // Reset core quiz variables
  const resetQuizEngine = () => {
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setQuizFinished(false);
    setDailyIndex(0);
    setScoreSubmittedMsg("");
    
    if (quizMode === 'practice') {
      generatePracticeQuestion();
    }
  };

  // Generate random infinite question for Category practice
  const generatePracticeQuestion = () => {
    const pool = selectedCategoryUrl === "all" 
      ? words 
      : words.filter(w => w.category === selectedCategoryUrl);

    if (pool.length < 4) {
      setCurrentQuestion(null);
      return;
    }

    const randIndex = Math.floor(Math.random() * pool.length);
    const targetWord = pool[randIndex];
    const questionType = Math.random() > 0.5 ? 'definition' : 'translation';

    const incorrectOptions: string[] = [];
    const tempPool = pool.filter(w => w.id !== targetWord.id);

    while (incorrectOptions.length < 3 && tempPool.length > 0) {
      const idx = Math.floor(Math.random() * tempPool.length);
      const chosenWord = tempPool.splice(idx, 1)[0];
      const optionText = questionType === 'definition' ? chosenWord.definition : chosenWord.translation;
      if (!incorrectOptions.includes(optionText)) {
        incorrectOptions.push(optionText);
      }
    }

    // fallback filler if pool size too small
    while (incorrectOptions.length < 3) {
      incorrectOptions.push("Premium standard English option");
    }

    const correctAnswerText = questionType === 'definition' ? targetWord.definition : targetWord.translation;
    const options = [...incorrectOptions];
    const correctPos = Math.floor(Math.random() * 4);
    options.splice(correctPos, 0, correctAnswerText);

    setCurrentQuestion({
      word: targetWord,
      options,
      correctIndex: correctPos,
      questionType
    });
    setSelectedAnswerIndex(null);
  };

  useEffect(() => {
    if (quizMode === 'practice') {
      generatePracticeQuestion();
    }
  }, [selectedCategoryUrl, words]);

  // Answer Selected Handler
  const handleSelectAnswer = (index: number) => {
    if (selectedAnswerIndex !== null) return;
    setSelectedAnswerIndex(index);
    setTotalQuestions(prev => prev + 1);

    const isCorrect = index === currentQuestion?.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Next Question triggers
  const handleNext = async () => {
    setSelectedAnswerIndex(null);
    
    if (quizMode === 'daily') {
      const nextIdx = dailyIndex + 1;
      if (nextIdx < dailyQuestionsList.length) {
        setDailyIndex(nextIdx);
        setCurrentQuestion(dailyQuestionsList[nextIdx]);
      } else {
        // Daily Quiz Complete! Submit highscore
        setQuizFinished(true);
        if (currentUser) {
          await submitDailyScore(score);
        }
      }
    } else {
      generatePracticeQuestion();
    }
  };

  // Submit earned points directly to the server leaderboard
  const submitDailyScore = async (finalCorrectCount: number) => {
    if (!currentUser) return;
    setIsSubmittingScore(true);
    // 10 points awarded per correct answer
    const pointsToSubmit = finalCorrectCount * 10;
    
    try {
      const response = await fetch('/api/score/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: currentUser.username,
          pointsEarned: pointsToSubmit
        })
      });

      if (response.ok) {
        setScoreSubmittedMsg(`Tabriklaymiz! Bugungi ${finalCorrectCount} ta to'g'ri javobingiz uchun +${pointsToSubmit} ball reytingingizga belgilandi! 👑`);
      }
    } catch (err) {
      console.error("Score submit error:", err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  return (
    <div id="quiz-container" className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
      {/* MODE MENU SELECTORS (DAILY vs PRACTICE) */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-855 mb-6 justify-between items-center">
        <span className="text-xs font-mono font-bold text-slate-400 pl-2 hidden sm:inline uppercase">O'yin rejimini tanlang:</span>
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setQuizMode('daily')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              quizMode === 'daily'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-550/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Bugungi Challenge
          </button>
          
          <button
            onClick={() => setQuizMode('practice')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              quizMode === 'practice'
                ? 'bg-[#182030] text-cyan-300 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Play className="w-4 h-4" />
            Tanlangan bo'lim mashqi
          </button>
        </div>
      </div>

      {loadingDaily ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold font-display text-white">Daily Challenge Yuklanmoqda...</h3>
          <p className="text-xs text-slate-400">Kunlik barqaror test savollari AI bazasidan ajratilmoqda.</p>
        </div>
      ) : quizFinished ? (
        /* CHALLENGE ACCOMPLISHED SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 px-6 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center border border-amber-400/30 text-amber-400 mx-auto animate-bounce shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white">Bugungi Challenge Yakunlandi!</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Kunlik stable random testdagi barcha 5 ta savolga muvaffaqiyatli javob berdiz. G'ayratingizga tasanno!
            </p>
          </div>

          <div className="flex justify-center gap-4 max-w-sm mx-auto">
            <div className="flex-1 p-4 bg-slate-950 rounded-2xl border border-slate-850">
              <span className="block text-[10px] font-mono uppercase text-slate-400">To'g'ri topildi</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-display">{score}/5</span>
            </div>
            <div className="flex-1 p-4 bg-slate-950 rounded-2xl border border-slate-850">
              <span className="block text-[10px] font-mono uppercase text-slate-400">Yutuq Boli</span>
              <span className="text-2xl font-extrabold text-amber-300 mt-1 block font-display">+{score * 10} XP</span>
            </div>
          </div>

          {scoreSubmettedMsg && (
            <div className="p-4 rounded-xl bg-cyan-400/10 text-cyan-300 text-xs sm:text-sm font-semibold max-w-md mx-auto border border-cyan-400/20">
              {scoreSubmettedMsg}
            </div>
          )}

          {!currentUser && (
            <div className="p-4 rounded-xl bg-red-400/10 text-red-300 text-xs font-semibold max-w-md mx-auto border border-red-400/20">
              ⚠️ Tizimga kirmaganligingiz sababli natijangiz Leaderboardga kiritilmadi. Reyting uchun yuqorida profilingizga kiring!
            </div>
          )}

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={fetchDailyQuestions}
              className="px-5 py-3 rounded-xl hover:bg-slate-850 text-slate-300 text-xs font-semibold border border-slate-800 transition"
            >
              Qayta urinish (Test)
            </button>
            <button
              onClick={() => setQuizMode('practice')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 text-white text-xs font-bold transition"
            >
              Barcha kategoriyalar bo'yicha mashq
            </button>
          </div>
        </motion.div>
      ) : (
        /* QUIZ ACTIVE VIEWPORT */
        <div>
          {/* Header Dashboard Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-850/80 mb-6">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                quizMode === 'daily'
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-450/20'
                  : 'bg-cyan-400/10 text-cyan-300 border border-cyan-450/20'
              }`}>
                <Trophy className="w-3.5 h-3.5" />
                {quizMode === 'daily' ? 'DAILY STABLE CHALLENGE' : 'PRACTICE MODE'}
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-display text-white mt-1.5 sm:mt-2">
                {quizMode === 'daily' ? "Bugun uchun Daily English Quiz" : "Category Practice Quiz"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {quizMode === 'daily' 
                  ? "Kunlik stable tasodifiy savollar to'plami. Har kuni yangi darajalar." 
                  : `${selectedCategoryName} kategoriyasidagi iboralar bo'yicha cheksiz mustahkamlash.`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {quizMode === 'daily' ? (
                <div className="text-center px-4 py-2 bg-slate-950/45 border border-slate-850 rounded-2xl min-w-[75px]">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase font-semibold">Savol</span>
                  <span className="text-lg md:text-xl font-bold font-display text-cyan-300">
                    {dailyIndex + 1}<span className="text-slate-500 text-xs">/5</span>
                  </span>
                </div>
              ) : (
                <div className="text-center px-4 py-2 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">To'g'ri</span>
                  <span className="text-lg md:text-xl font-bold font-display text-emerald-400">
                    {score}<span className="text-slate-500 text-sm">/{totalQuestions}</span>
                  </span>
                </div>
              )}

              <div className="text-center px-4 py-2 bg-slate-950/40 border border-slate-850 rounded-2xl min-w-[70px]">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Streak 🔥</span>
                <span className="text-lg md:text-xl font-bold font-display text-amber-405">
                  {streak}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.word.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Question Label */}
                <div className="mb-6">
                  <span className="text-xs font-mono text-cyan-400 tracking-wider font-bold block mb-1">
                    QUIZ QUESTION:
                  </span>
                  <h3 className="text-2xl md:text-3.5xl font-extrabold font-display text-white tracking-tight leading-tight">
                    What is the correct match for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 underline decoration-indigo-400/80">"{currentQuestion.word.word}"</span>?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 pl-1">
                    {currentQuestion.questionType === 'definition' 
                      ? "Berilgan iboraning asl inglizcha ma'nosini (English Definition) toping:" 
                      : "Berilgan iboraning o'zbekcha to'g'ri tarjimasi va real-life ma'nosini toping:"}
                  </p>
                </div>

                {/* Answer Options Grid */}
                <div className="grid grid-cols-1 gap-3.5 mb-6">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = currentQuestion.correctIndex === idx;
                    const hasAnswered = selectedAnswerIndex !== null;

                    let btnStyles = "border-slate-800 bg-slate-950/30 text-slate-300 hover:border-slate-705 hover:bg-slate-900/40";
                    
                    if (hasAnswered) {
                      if (isCorrect) {
                        btnStyles = "border-emerald-500 bg-emerald-550/10 text-emerald-300 font-semibold";
                      } else if (isSelected) {
                        btnStyles = "border-red-500 bg-red-500/10 text-red-300";
                      } else {
                        btnStyles = "border-slate-850 bg-slate-950/10 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        id={`quiz-option-${idx}`}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={hasAnswered}
                        className={`flex items-start gap-3 w-full p-4.5 text-left rounded-2xl border text-sm md:text-base leading-relaxed transition-all duration-200 cursor-pointer ${btnStyles}`}
                      >
                        <span className="flex items-center justify-center p-1 px-3.5 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-300 shadow">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-0.5">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Answer feedback section */}
                <AnimatePresence>
                  {selectedAnswerIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-slate-950/75 border border-slate-850/80 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {selectedAnswerIndex === currentQuestion.correctIndex ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                            <CheckCircle className="w-3.5 h-3.5" /> TO'G'RI JAVOB! Awesome job!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-400/30">
                            <AlertCircle className="w-3.5 h-3.5" /> SHOSHILMANG. Xato belgilandi!
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed pl-1 mb-2">
                        Mos keladigan to'g'ri ta'rif: <span className="text-emerald-400 font-bold font-semibold">{currentQuestion.options[currentQuestion.correctIndex]}</span>
                      </p>

                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs leading-relaxed text-indigo-200">
                        <span className="block text-[10px] font-mono font-bold text-indigo-400 mb-0.5 uppercase tracking-wide">Coach Explanation & Tips:</span>
                        💡 {currentQuestion.word.ieltsTip}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer buttons Controls */}
                <div className="flex items-center justify-between">
                  {quizMode === 'practice' ? (
                    <button
                      id="reset-quiz-btn"
                      onClick={resetQuizEngine}
                      className="px-4 py-2.5 text-xs font-semibold cursor-pointer text-slate-400 hover:text-white bg-slate-850/40 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all"
                    >
                      Qayta boshlash
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">
                      IELTS Scholars Arena — Kunlik o'yin
                    </span>
                  )}

                  <button
                    id="next-question-btn"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl cursor-pointer bg-gradient-to-r from-sky-450 via-indigo-550 to-indigo-600 text-white font-bold text-sm hover:opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    <span>{quizMode === 'daily' && dailyIndex === 4 ? "Challenge yakunlash" : "Keyingi savol"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto text-slate-505 mb-3 animate-pulse" />
                <h3 className="font-bold text-lg text-white">Xatolik: So'zlar bazasi yetarli emas</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Lug'atingizda ko'proq elementlar bo'lishi lozim. 'Lug'at' bo'limida yangi so'zlar yoki kategoriyalarni tekshiring.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
