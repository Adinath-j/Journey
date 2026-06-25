import type { Metric } from "@/types/dashboard";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  metric: Metric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon;
  const isProgress = metric.progress !== undefined;

  return (
    <GlassCard interactive className={cn("metric-card relative min-h-[116px] overflow-hidden p-5", `metric-${metric.accent}`)}>
      {isProgress ? (
        <div className="flex h-full items-center gap-4">
          <ProgressRing value={metric.progress ?? 0} />
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[13px] text-slate-200">{metric.label}</p>
            <p className="mt-1 text-[31px] font-semibold leading-none tracking-tight text-violet-400">{metric.value}</p>
            <p className="mt-2 text-xs text-violet-400">{metric.message}</p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-start gap-4">
          <div className={cn("metric-icon grid size-10 shrink-0 place-items-center rounded-2xl", `icon-${metric.accent}`)}>
            <Icon className="size-6" strokeWidth={2.1} />
          </div>
          <div>
            <p className="whitespace-nowrap text-[13px] text-slate-200">{metric.label}</p>
            <p className="mt-3 text-[30px] font-medium leading-none tracking-tight text-slate-50">{metric.value}</p>
            <p className="mt-2 text-xs text-slate-300">{metric.suffix}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
