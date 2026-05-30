import React, { useState } from 'react';
import { WordItem } from '../types';
import { Sparkles, Loader2, Play, BookOpen, Trash2, ArrowUpRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIGeneratorProps {
  currentCount: number;
  categoryUrl: string;
  categoryName: string;
  words: WordItem[];
  onItemsGenerated: (newItems: WordItem[]) => void;
  onResetToDefault: () => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  currentCount,
  categoryUrl,
  categoryName,
  words,
  onItemsGenerated,
  onResetToDefault
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);

    const stages = [
      "Idrokbek dars tayyorlamoqda...",
      "IELTS 8+ muqobil variantlarni tanlamoqda...",
      "Qaytarilmas misollar va O'zbekcha tarjimalar yozilmoqda...",
      "Siz uchun 'Cool' maslahatlar jamlanmoqda..."
    ];

    let currentStage = 0;
    setStatusText(stages[0]);
    const timer = setInterval(() => {
      currentStage = (currentStage + 1) % stages.length;
      setStatusText(stages[currentStage]);
    }, 2500);

    try {
      // Gather list of words currently in this category to prevent overlaps/duplicates
      const wordsInCat = words.filter(w => w.category === categoryUrl).map(w => w.word);

      const response = await fetch("/api/gemini/generate-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryUrl,
          existingWords: wordsInCat
        })
      });

      clearInterval(timer);

      if (!response.ok) {
        throw new Error("Yangi ma'lumotlarni yuklab bo'lmadi. Port yoki kalitni tekshiring.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.newItems && Array.isArray(data.newItems)) {
        onItemsGenerated(data.newItems);
      } else {
        throw new Error("Kutilmagan JSON format qaytdi.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 
        "Ulanishda uzilish. Kalit kiritilmagan bo'lishi mumkin. Iltimos default so'zlar bilan mashq qiling."
      );
    } finally {
      setLoading(false);
      clearInterval(timer);
    }
  };

  // Compute percentage towards the 200 goals
  const targetCount = 200;
  const percent = Math.min(Math.round((currentCount / targetCount) * 100), 100);

  return (
    <div id="ai-generator-widget" className="p-5 rounded-3xl bg-slate-900/30 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold font-display text-white text-sm md:text-base leading-none">
            AI Category Expander
          </h4>
          <span className="text-[11px] text-slate-400">Idrokbek AI Vocabulary Coach</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Siz hozirda <span className="font-bold text-white">"{categoryName}"</span> bo'limidasiz. 
        Muntazam ravishda yangi iboralar yuklab, umumiy ro'yxatni <span className="text-cyan-300 font-bold">200 tagacha</span> oshiring!
      </p>

      {/* Goal Progress bar metrics */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1.5">
          <span className="text-slate-400">LUZ PROGRESS:</span>
          <span className="text-cyan-300">{currentCount} / {targetCount} so'z ({percent}%)</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* Restore defaults reset action button */}
        <button
          id="reset-dictionary-btn"
          onClick={onResetToDefault}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-mono font-medium rounded-xl cursor-pointer border border-slate-850 bg-slate-950/20 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tizimni dastlabki holatga qaytarish</span>
        </button>
      </div>

      {loading && (
        <p className="text-[11px] text-center italic text-indigo-300 font-mono mt-3 animate-pulse">
          {statusText}
        </p>
      )}

      {/* Custom Error handle message with explanations */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <p className="font-semibold mb-1">Mavjud xabar:</p>
          <p className="opacity-90 leading-relaxed font-sans">{errorMessage}</p>
          <div className="mt-2 text-[10px] bg-amber-500/5 p-1.5 rounded-lg border border-amber-500/10 font-mono">
            💡 Maslahat: default so'zlar bilan sayt barcha funksiyalarini to'liq bepul ishlata olasiz!
          </div>
        </div>
      )}
    </div>
  );
};
