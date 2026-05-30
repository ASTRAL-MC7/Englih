import React, { useState, useEffect, useRef } from 'react';
import { WordItem } from '../types';
import { MessageSquare, Send, Sparkles, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIPracticeProps {
  words: WordItem[];
  selectedCategoryName: string;
}

export const AIPractice: React.FC<AIPracticeProps> = ({
  words,
  selectedCategoryName
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial message from Idrokbek
  const restartChat = () => {
    setMessages([
      {
        id: "initial-1",
        sender: "assistant",
        text: `Cheers, mate! I'm Idrokbek, your English coaching tutor. 🎓 I noticed you are checking out the "${selectedCategoryName}" category. Let's make you sound like a proper local! 

Try to answer my question or write any sentence. If you can, use some of the cool words you just learned! 

How is your day going so far?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorMsg(null);
  };

  useEffect(() => {
    restartChat();
  }, [selectedCategoryName]);

  useEffect(() => {
    // Scroll to bottom smoothly when new message arrives
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();
    setInputValue("");
    setErrorMsg(null);

    // Append user message
    const newUserMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    setLoading(true);

    try {
      // Gather lists of active words
      const wordList = words.slice(0, 15).map(w => w.word);

      const response = await fetch("/api/gemini/practice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          categoryName: selectedCategoryName,
          wordList
        })
      });

      if (!response.ok) {
        throw new Error("Tutor can't connect right now. Check standard internet.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `idrokbek-${Date.now()}`,
          sender: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Tizim ulanishida kichik xatolik. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-practice-container" className="flex flex-col h-[450px] sm:h-[550px] rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md overflow-hidden">
      {/* Practice Panel Header */}
      <div className="flex items-center justify-between p-5 bg-slate-950/40 border-b border-slate-850/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-display font-bold">
              ID
            </div>
            {/* online active status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-550 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm md:text-base font-display flex items-center gap-1.5 leading-none">
              Idrokbek <span className="text-xs text-indigo-400 font-mono font-medium">IELTS Coach</span>
            </h3>
            <span className="text-[11px] text-slate-400">Practicing: {selectedCategoryName}</span>
          </div>
        </div>

        <button
          id="restart-chat-btn"
          onClick={restartChat}
          className="p-2 cursor-pointer rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs"
          title="Muloqotni boshidan boshlash"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Target Word coaching reminder bar */}
      <div className="px-5 py-2 bg-slate-950/20 border-b border-slate-850/60 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-mono text-[10px] uppercase font-bold text-slate-300">Mashq Iboralari:</span>
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[22px]">
          {words.slice(0, 5).map(w => (
            <span key={w.id} className="bg-slate-800/40 text-[10px] text-cyan-300 px-2 py-0.5 rounded border border-slate-700/55 font-semibold">
              {w.word}
            </span>
          ))}
          {words.length > 5 && <span className="text-[10px] text-slate-500">+{words.length - 5}</span>}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/10">
        {messages.map((m) => {
          const isMe = m.sender === "user";
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] group`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold font-display shrink-0 mt-1 shadow-sm">
                    I
                  </div>
                )}
                
                <div className={`flex flex-col`}>
                  <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow border ${
                    isMe 
                      ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-100 border-sky-500/30 rounded-tr-none' 
                      : 'bg-slate-900 border-slate-850 text-slate-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <span className={`text-[9px] mt-1 font-mono text-slate-400 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
                I
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error warning notification */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2 max-w-md mx-auto">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold select-none">Ulanish xatosi:</p>
              <p className="opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input panel footer */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/40 border-t border-slate-850/80 flex items-center gap-2">
        <input
          id="chat-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Idrokbek bilan gaplashing (ingliz tilida yozing)...`}
          className="flex-1 px-4 py-3 text-sm bg-slate-950/50 border border-slate-850 focus:border-cyan-500 focus:outline-none rounded-2xl text-slate-100 placeholder:text-slate-400"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="p-3 cursor-pointer rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-md shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
