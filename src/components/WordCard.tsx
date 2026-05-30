import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Star, BadgeAlert, Sparkles, Languages, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface WordCardProps {
  item: WordItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onExploreDetailed?: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onExploreDetailed
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert("⚠️ Brauzeringiz audio talaffuz texnologiyasini qo'llab-quvvatlamaydi.");
      return;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    
    // Speak English word
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'en-GB'; // British elegance for IELTS vibe!
    utterance.rate = 0.85; // Slightly measured and steady

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      id={`card-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="relative flex flex-col justify-between h-full p-6 text-slate-100 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-sky-500/50 hover:bg-slate-900/70 transition-all duration-300 backdrop-blur-md group"
    >
      {/* Background neon effect on hover */}
      <div className="absolute inset-0 bg-transparent rounded-2xl group-hover:bg-gradient-to-br group-hover:from-cyan-500/5 group-hover:to-indigo-500/5 pointer-events-none transition-all duration-300" />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {item.isAiGenerated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-sky-500/10 text-sky-400 border border-sky-400/20">
                <Sparkles className="w-2.5 h-2.5" /> AI CHIP
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
              IELTS 8+
            </span>
          </div>

          <button
            id={`bookmark-btn-${item.id}`}
            onClick={() => onToggleBookmark(item.id)}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              isBookmarked
                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
            title={isBookmarked ? "Belgilanganlardan o'chirish" : "Belgilanib saqlash"}
          >
            <Star className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Word and Sound Trigger */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-200">
            {item.word}
          </h3>
          <button
            id={`speak-btn-${item.id}`}
            onClick={handleSpeak}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isSpeaking
                ? 'bg-cyan-400/20 text-cyan-400 scale-110'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Audio Talaffuzi (UK Accent)"
          >
            <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Instead of tag if present */}
        {item.ratherThan && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 mb-3 bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl text-xs sm:text-sm font-sans font-medium">
            <span className="font-semibold text-red-400">Oddiy:</span>
            <span className="line-through opacity-70 text-red-200">{item.ratherThan}</span>
            <span className="mx-1">➡️</span>
            <span className="font-semibold text-emerald-400">Ishlating:</span>
            <span className="font-bold underline text-white font-display decoration-emerald-400">{item.word}</span>
          </div>
        )}

        {/* English Definition */}
        <p className="text-sm md:text-base text-slate-350 leading-relaxed font-sans mb-3 pl-1 border-l-2 border-slate-700">
          <span className="text-slate-400 font-mono text-xs block mb-0.5 tracking-wider uppercase font-semibold">DEFINITION:</span>
          {item.definition}
        </p>

        {/* Uzbek Translation */}
        <div className="p-3 mb-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>O‘zbekcha Ma’nosi:</span>
          </div>
          <p className="text-sm text-cyan-200 font-medium leading-relaxed pl-1">
            {item.translation}
          </p>
        </div>

        {/* Practical Example */}
        <div className="mb-4">
          <span className="text-slate-400 font-mono text-xs block mb-1 tracking-wider uppercase font-semibold">EXAMPLE SENTENCE:</span>
          <p className="text-sm text-slate-300 italic pl-3 border-l-2 border-cyan-500 bg-cyan-950/10 py-1.5 rounded-r-xl">
            "{item.example}"
          </p>
        </div>
      </div>

      {/* IELTS coaching footer banner */}
      <div className="pt-3 border-t border-slate-800/80 mt-auto">
        <div className="flex items-start gap-1.5 text-xs text-amber-300/90 leading-relaxed bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono uppercase font-bold text-[10px] text-amber-400 block tracking-wider">IELTS Band-8+ Coaching Tip:</span>
            {item.ieltsTip}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
