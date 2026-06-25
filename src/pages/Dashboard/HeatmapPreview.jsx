import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { cn } from "@/lib/cn";
import { useDashboardStore } from "@/store/useDashboardStore";

const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HeatmapPreview() {
  const heatmapData = useDashboardStore((state) => state.heatmap) || [];

  const { heatmapValues, heatmapMonths } = useMemo(() => {
    // Generate a 7x15 matrix (rows: days, cols: weeks) initialized to 0
    const matrix = Array.from({ length: 7 }, () => Array.from({ length: 15 }, () => 0));
    
    // Create a map of date strings to intensities
    const dataMap = new Map(heatmapData.map(h => [h.date, h.intensity]));
    
    // We go backwards from today to fill the last 15 weeks (105 days)
    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // Mon = 0, Sun = 6
    
    // The very last cell is column 14, row `currentDayOfWeek`
    let col = 14;
    let row = currentDayOfWeek;

    const monthsSet = new Set();
    const months = [];

    for (let i = 0; i < 105; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      matrix[row][col] = dataMap.get(dateStr) || 0;

      // Track months for headers (simple approximation)
      if (row === 0) {
        const monthName = d.toLocaleDateString("en-US", { month: "short" });
        if (!monthsSet.has(monthName)) {
          monthsSet.add(monthName);
          months.unshift({ label: monthName, start: col, span: 4 });
        }
      }

      row--;
      if (row < 0) {
        row = 6;
        col--;
      }
    }

    return { heatmapValues: matrix, heatmapMonths: months };
  }, [heatmapData]);

  return (
    <GlassCard className="p-5">
      <SectionTitle icon={CalendarDays}>Study Heatmap</SectionTitle>
      <div className="mt-3 grid grid-cols-[32px_1fr] gap-2">
        <div className="pt-6">
          {heatmapDays.map((day) => <div key={day} className="h-[18px] text-[10px] leading-[14px] text-slate-400">{day}</div>)}
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="mb-1 grid grid-cols-15">
            {heatmapMonths.map((month, i) => <span key={i} className="text-[11px] text-slate-300" style={{ gridColumn: `${Math.max(1, month.start + 1)} / span ${month.span}` }}>{month.label}</span>)}
          </div>
          <div className="grid grid-flow-col grid-cols-15 grid-rows-7 gap-[4px]">
            {Array.from({ length: 15 }, (_, column) => heatmapValues.map((row) => row[column])).flat().map((value, index) => (
              <span key={index} className={cn("aspect-square min-h-[12px] rounded-[3px]", `heat-${value}`)} title={`${value} activity level`} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span>Keep showing up! 💪</span>
        <div className="flex items-center gap-1"><span>Less</span>{[0,1,2,3,4].map((level) => <span key={level} className={cn("size-3 rounded-[3px]", `heat-${level}`)} />)}<span>More</span></div>
      </div>
    </GlassCard>
  );
}
