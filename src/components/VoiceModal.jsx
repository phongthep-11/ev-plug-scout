import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, VolumeX, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speechService';

export function VoiceModal({ isOpen, onClose, stations, onSelectStation }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedStation, setMatchedStation] = useState(null);

  // Quick preset questions for driver safety
  const PRESET_QUESTIONS = [
    "ปั๊มข้างหน้าว่างไหม?",
    "รถ JAECOO 5 ชาร์จตู้ข้างหน้าได้ไหม?",
    "หาตู้ว่างที่ใกล้ที่สุด",
    "มีหัวชาร์จ Ultra Fast 360 kW ไหม?"
  ];

  useEffect(() => {
    if (isOpen) {
      // Default query on opening: "ปั๊มข้างหน้าว่างไหม?"
      handleAskQuestion("ปั๊มข้างหน้าว่างไหม?");
    } else {
      speechService.stop();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleAskQuestion = (questionText) => {
    setErrorMsg('');
    setTranscript(questionText);
    const result = speechService.generateAnswer(questionText, stations);
    setAnswer(result.text);
    setMatchedStation(result.targetStation);

    // Speak answer in Thai
    speechService.speak(
      result.text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStartListening = () => {
    speechService.stop();
    setIsSpeaking(false);
    setErrorMsg('');
    setTranscript('กำลังฟังคำสั่งเสียงของคุณ...');

    speechService.listen({
      onStart: () => setIsListening(true),
      onResult: (text) => {
        setIsListening(false);
        handleAskQuestion(text);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg('ไม่สามารถรับเสียงได้ กรุณาแตะเลือกคำถามด่วนด้านล่างแทนครับ');
      },
      onEnd: () => setIsListening(false)
    });
  };

  const handleStopSpeaking = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0f1624] border border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-slate-100 flex flex-col items-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow blob */}
        <div className="absolute -top-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-5">
          <Sparkles size={13} className="text-emerald-400" />
          <span>ผู้ช่วยเสียง AI อัจฉริยะ (Voice Assistant)</span>
        </div>

        {/* Animated Microphone / Soundwave Circle */}
        <div className="relative mb-6">
          <button
            onClick={isListening ? () => speechService.stop() : handleStartListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
              isListening
                ? "bg-red-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.5)] scale-105"
                : isSpeaking
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.6)]"
                : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            }`}
          >
            {isListening ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-8 bg-white rounded-full animate-bounce" />
                <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse stroke-[2.5]" />
            ) : (
              <Mic className="w-10 h-10 stroke-[2.5]" />
            )}
          </button>

          {/* Pulse ring when speaking or listening */}
          {(isListening || isSpeaking) && (
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none" />
          )}
        </div>

        <p className="text-xs text-slate-400 mb-2 font-medium">
          {isListening 
            ? "กำลังฟังเสียงของคุณ พูดได้เลยครับ..." 
            : isSpeaking 
            ? "กำลังตอบด้วยเสียงภาษาไทย..." 
            : "แตะไมโครโฟนเพื่อพูดคำสั่ง หรือเลือกคำถามด้านล่าง"}
        </p>

        {/* Spoken Query Display */}
        {transcript && (
          <div className="w-full text-center px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-3">
            <span className="text-xs text-slate-400 block mb-0.5">คำถามที่คุณพูด:</span>
            <p className="text-sm font-semibold text-white">“{transcript}”</p>
          </div>
        )}

        {/* AI Spoken Answer Display */}
        {answer && (
          <div className="w-full p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-4 text-left">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Volume2 size={13} />
                <span>คำตอบจากระบบ:</span>
              </span>
              {isSpeaking ? (
                <button 
                  onClick={handleStopSpeaking}
                  className="text-[11px] underline text-slate-300 hover:text-white"
                >
                  หยุดพูด
                </button>
              ) : (
                <button 
                  onClick={() => speechService.speak(answer, () => setIsSpeaking(true), () => setIsSpeaking(false))}
                  className="text-[11px] underline text-emerald-300 hover:text-white"
                >
                  ฟังซ้ำ
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {answer}
            </p>

            {/* If a station was matched, allow viewing details */}
            {matchedStation && (
              <button
                onClick={() => {
                  onClose();
                  onSelectStation(matchedStation);
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>ดูรายละเอียด {matchedStation.name}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="w-full p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 mb-3">
            <AlertCircle size={15} className="flex-shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Question Buttons */}
        <div className="w-full mt-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2 text-center">
            คำถามด่วน (กดถามทันที)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(q)}
                className="text-left text-xs p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-98 truncate"
              >
                ⚡ {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

