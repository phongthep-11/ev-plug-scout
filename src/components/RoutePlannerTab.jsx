import React, { useState } from 'react';
import { Route, MapPin, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export function RoutePlannerTab({ stations, onSelect, onNavigate }) {
  const [origin, setOrigin] = useState("กรุงเทพฯ (เซ็นทรัล พระราม 2)");
  const [destination, setDestination] = useState("หัวหิน (จ.ประจวบคีรีขันธ์)");
  const [plannedStops, setPlannedStops] = useState([stations[0], stations[2], stations[4]]);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="text-emerald-400" size={18} />
          <span>วางแผนชาร์จตามเส้นทาง (Route Planning)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">คำนวณจุดแวะชาร์จที่เหมาะสม พร้อมเช็กสถานะตู้ว่างล่วงหน้า</p>
      </div>

      {/* Origin - Destination Selector Card */}
      <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="w-0.5 h-8 bg-slate-700 my-1" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 block">จุดเริ่มต้น</label>
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">จุดหมายปลายทาง</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <span>ระยะทางรวม: <b className="text-white">186 กม.</b></span>
          <span>เวลาเดินทาง: <b className="text-white">~2 ชม. 45 นาที</b></span>
        </div>
      </div>

      {/* Suggested Charging Itinerary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            จุดแวะชาร์จที่แนะนำตามแผน (Smart Stops)
          </h3>
          <span className="text-[11px] text-emerald-400">แนะนำแวะ 1 จุด</span>
        </div>

        {plannedStops.map((st, idx) => (
          <div 
            key={st.id} 
            onClick={() => onSelect(st)}
            className="p-3.5 rounded-2xl bg-[#131926] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.providerTheme.bg} ${st.providerTheme.text} ${st.providerTheme.border}`}>
                    {st.provider}
                  </span>
                  <span className="text-[11px] text-slate-400">กม.ที่ {st.distanceKm}</span>
                </div>
                <h4 className="font-semibold text-xs text-white mt-0.5">{st.name}</h4>
                <div className="flex items-center gap-2 text-[11px] mt-1">
                  <span className={st.availablePlugs > 0 ? "text-emerald-400" : "text-amber-400"}>
                    {st.availablePlugs > 0 ? `ว่าง ${st.availablePlugs} หัว` : "ตู้เต็ม (มีคิว)"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-mono">{st.power}</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(st);
              }}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs"
            >
              นำทาง
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

