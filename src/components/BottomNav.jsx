import React from 'react';
import { Compass, Route, Calculator, Car, ShieldAlert } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, availableCount }) {
  const TABS = [
    { id: 'route', label: 'สถานีชาร์จ', icon: Compass, badge: availableCount },
    { id: 'plan', label: 'วางแผนทริป', icon: Route },
    { id: 'calc', label: 'คำนวณไฟ', icon: Calculator },
    { id: 'car', label: 'รถของฉัน', icon: Car },
    { id: 'saved', label: 'ฉุกเฉิน/โปรด', icon: ShieldAlert },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 pt-2 safe-bottom px-2 sm:px-4 shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
      <div className="max-w-xl mx-auto grid grid-cols-5 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[52px] py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <div className="relative">
                <Icon size={18} className={isActive ? "stroke-[2.4] text-emerald-400" : "stroke-[1.8]"} />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px] leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight whitespace-nowrap truncate max-w-full ${isActive ? "font-extrabold text-white" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
