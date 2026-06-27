import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Flame, ChevronLeft, ChevronRight, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { cn } from "@/lib/cn";

function ActivityPanel({ isOpen, data, onClose }) {
  if (!isOpen || !data) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-md bg-[#0f1524] border-l border-white/10 h-full flex flex-col shadow-2xl transform transition-transform">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-black/20">
           <div>
             <h2 className="text-lg font-semibold text-slate-100">
               {new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric" })}
             </h2>
             <p className="text-xs text-slate-400 mt-1">Daily Activity Overview</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
             <X className="size-5"/>
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {data.totalMinutes > 0 ? (
            <div className="space-y-8">
              {/* Aggregation: Duration */}
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 text-center">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Total Study Time</span>
                <span className="text-violet-400 text-4xl font-bold tracking-tight">
                  {Math.floor(data.totalMinutes / 60)}<span className="text-xl text-violet-500/70 ml-1 mr-2">h</span> 
                  {data.totalMinutes % 60}<span className="text-xl text-violet-500/70 ml-1">m</span>
                </span>
              </div>

              {/* Topics */}
              {data.topics?.length > 0 && (
                <div>
                  <h3 className="text-slate-500 uppercase text-xs font-semibold tracking-wider mb-3 flex items-center gap-2">
                    Topics
                    <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{data.topics.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.topics.map((t, i) => (
                      <span key={i} className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-200">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problems */}
              {data.problems?.length > 0 && (
                <div>
                  <h3 className="text-slate-500 uppercase text-xs font-semibold tracking-wider mb-3 flex items-center gap-2">
                    Problems Solved
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full">{data.problems.length}</span>
                  </h3>
                  <ul className="space-y-2">
                    {data.problems.map((p, i) => (
                      <li key={i} className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg text-sm text-slate-300 flex items-center gap-3">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concepts */}
              {data.concepts?.length > 0 && (
                <div>
                  <h3 className="text-slate-500 uppercase text-xs font-semibold tracking-wider mb-3 flex items-center gap-2">
                    Concepts Learned
                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full">{data.concepts.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.concepts.map((c, i) => (
                      <span key={i} className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-200">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {data.notes?.length > 0 && (
                <div>
                  <h3 className="text-slate-500 uppercase text-xs font-semibold tracking-wider mb-3">Notes</h3>
                  <div className="space-y-3">
                    {data.notes.map((n, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed bg-black/40 border-l-2 border-violet-500/50 pl-4 py-3 pr-4 rounded-r-lg italic">
                        "{n}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Flame className="size-8 opacity-20" />
              </div>
              <p className="text-sm">No activity recorded on this day.</p>
              <p className="text-xs mt-1 opacity-60">Consistency is key!</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HeatmapCard({ heatmapData }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [tooltipState, setTooltipState] = useState({ isOpen: false, position: { x: 0, y: 0 }, data: null });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const { calendarCells, totalHoursThisMonth } = useMemo(() => {
    const dataMap = new Map(heatmapData.map(h => [h.date, h]));
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun, 1 is Mon
    const emptyCellsBefore = (firstDay === 0 ? 6 : firstDay - 1); // Make Monday = 0

    const cells = [];
    let monthMinutes = 0;

    // Empty cells at start of month
    for (let i = 0; i < emptyCellsBefore; i++) {
      cells.push({ isEmpty: true });
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create local date string ensuring timezone doesn't mess up the day
      const d = new Date(Date.UTC(currentYear, currentMonth, day));
      const dateStr = d.toISOString().split("T")[0];
      
      const dayData = dataMap.get(dateStr) || { intensity: 0, totalMinutes: 0, topics: [], problems: [], concepts: [], resources: [], notes: [] };
      monthMinutes += dayData.totalMinutes;
      cells.push({ isEmpty: false, day, dateStr, ...dayData });
    }

    return { calendarCells: cells, totalHoursThisMonth: Math.round(monthMinutes / 60) };
  }, [currentYear, currentMonth, heatmapData]);

  const handleCellClick = (e, cellData) => {
    if (cellData.isEmpty) return;
    setTooltipState({
      isOpen: true,
      data: { date: cellData.dateStr, ...cellData }
    });
  };

  return (
    <>
      <GlassCard className="p-5 flex flex-col h-full overflow-visible">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Flame}>Study Heatmap</SectionTitle>
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="p-1 text-slate-400 hover:text-white transition-colors bg-white/5 rounded"><ChevronLeft className="size-4" /></button>
            <span className="text-sm font-medium text-slate-200 w-24 text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={handleNextMonth} className="p-1 text-slate-400 hover:text-white transition-colors bg-white/5 rounded"><ChevronRight className="size-4" /></button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-[10px] uppercase tracking-wider text-slate-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {calendarCells.map((cell, idx) => (
              <div 
                key={idx}
                onClick={(e) => handleCellClick(e, cell)}
                className={cn(
                  "relative rounded-md flex items-center justify-center text-sm font-medium transition-all duration-200 border border-white/5",
                  cell.isEmpty ? "bg-transparent border-transparent" : "cursor-pointer hover:border-violet-500/50 hover:scale-105",
                  cell.intensity === 0 && !cell.isEmpty ? "bg-black/20 text-slate-500" :
                  cell.intensity === 1 ? "bg-emerald-900/40 text-emerald-100 border-emerald-500/20" :
                  cell.intensity === 2 ? "bg-emerald-700/50 text-emerald-50 border-emerald-500/30" :
                  cell.intensity === 3 ? "bg-emerald-500/60 text-white border-emerald-400/40" :
                  cell.intensity >= 4 ? "bg-emerald-400 text-slate-900 border-emerald-300/50 font-bold" : ""
                )}
              >
                {!cell.isEmpty && cell.day}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 px-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span>Keep showing up! 💪</span>
          </div>
          <span>Total this month: {totalHoursThisMonth} hrs</span>
        </div>
      </GlassCard>

      <ActivityPanel 
        isOpen={tooltipState.isOpen}
        data={tooltipState.data}
        onClose={() => setTooltipState({ ...tooltipState, isOpen: false })}
      />
    </>
  );
}
