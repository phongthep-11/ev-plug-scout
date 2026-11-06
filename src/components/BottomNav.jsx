import React from 'react';
import { Compass, Bookmark, Route, Car } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab }) {
  const TABS = [
    { id: 'route', label: 'สถานีบนทาง', icon: Compass },
    { id: 'saved', label: 'บันทึกแล้ว', icon: Bookmark },
    { id: 'plan', label: 'วางแผนชาร์จ', icon: Route },
    { id: 'car', label: 'รถของฉัน', icon: Car },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d121f]/95 backdrop-blur-lg border-t border-slate-800/90 py-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive 
                  ? "text-emerald-400 font-medium scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

