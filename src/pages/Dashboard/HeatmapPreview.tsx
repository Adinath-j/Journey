import { CalendarDays } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { heatmapDays, heatmapMonths, heatmapValues } from "@/data/mock/heatmap";
import { cn } from "@/lib/cn";

export function HeatmapPreview() {
  return (
    <GlassCard className="p-5">
      <SectionTitle icon={CalendarDays}>Study Heatmap</SectionTitle>
      <div className="mt-3 grid grid-cols-[32px_1fr] gap-2">
        <div className="pt-6">
          {heatmapDays.map((day) => <div key={day} className="h-[18px] text-[10px] leading-[14px] text-slate-400">{day}</div>)}
        </div>
        <div className="min-w-0">
          <div className="mb-1 grid grid-cols-15">
            {heatmapMonths.map((month) => <span key={month.label} className="text-[11px] text-slate-300" style={{ gridColumn: `${month.start + 1} / span ${month.span}` }}>{month.label}</span>)}
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
