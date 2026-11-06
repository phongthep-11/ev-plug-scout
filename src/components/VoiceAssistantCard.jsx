import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

export function VoiceAssistantCard({ onOpenVoice, isSpeaking, lastVoiceText }) {
  return (
    <div 
      onClick={onOpenVoice}
      className="relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-r from-[#0e2422]/90 via-[#0d1f27]/90 to-[#0e1829]/90 border border-emerald-500/30 p-4 shadow-[0_4px_24px_rgba(16,185,129,0.12)] transition-all hover:border-emerald-500/50 hover:shadow-[0_4px_30px_rgba(16,185,129,0.2)] active:scale-[0.99]"
    >
      {/* Subtle background glow */}
      <div className="absolute -left-10 -top-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        {/* Left: Glowing Microphone Icon */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-6">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-4" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-6" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-3" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:450ms] h-5" />
              </div>
            ) : (
              <Mic className="w-6 h-6 animate-pulse" />
            )}
          </div>
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          )}
        </div>

        {/* Center: Text prompt */}
        <div className="flex-1 min-w-0 pr-1">
          <h2 className="text-white font-semibold text-base sm:text-lg tracking-tight leading-snug truncate">
            “ปั๊มข้างหน้าว่างไหม?”
          </h2>
          <p className="text-emerald-400/80 text-xs mt-0.5 flex items-center gap-1.5 truncate">
            <span>แตะเพื่อถามผู้ช่วย AI ตรวจสอบสถานะด่วน</span>
          </p>
        </div>

        {/* Right: "ถามเลย" Action Button */}
        <div className="flex-shrink-0">
          <button 
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Mic size={14} className="stroke-[2.5]" />
            <span>ถามเลย</span>
          </button>
        </div>
      </div>

      {/* Live Speaking Status Indicator bar */}
      {isSpeaking && (
        <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
          <Volume2 size={14} className="animate-pulse text-emerald-400" />
          <span className="truncate italic font-normal">AI กำลังตอบด้วยเสียง...</span>
        </div>
      )}
    </div>
  );
}

