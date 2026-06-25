import { useEffect } from "react";
import { BarChart3, Check, CheckCircle2, Clock3, Code2, Flame, GitCommitHorizontal, Lightbulb, Quote, Sparkles, Target, Trophy } from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDashboardStore } from "@/store/useDashboardStore";
import { HeatmapPreview } from "@/pages/Dashboard/HeatmapPreview";

const metricIcons = {
  progress: BarChart3,
  streak: Flame,
  hours: Clock3,
  projects: CheckCircle2,
};

const quickStatIcons = {
  "Total Study Hours": Clock3,
  "Topics Completed": Trophy,
};

export default function Dashboard() {
  const { overview, metrics, quickStats, focusItems, missionItems, fetchDashboard, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading || !overview) {
    return <PageContainer><div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Loading your journey…</div></PageContainer>;
  }

  return (
    <PageContainer>
      <section className="mb-5 flex items-start justify-between px-2">
        <div>
          <h1 className="text-[27px] font-semibold tracking-tight text-slate-50">{overview.greeting}, {overview.userName}! <span aria-hidden="true">👋</span></h1>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-slate-300"><Sparkles className="size-4 text-violet-400" />{overview.subtitle} <span aria-hidden="true">✨</span></p>
        </div>
        <time className="pt-1 text-right text-xs leading-7 text-slate-300"><span className="block">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span><strong className="text-[23px] font-normal tracking-wide">{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong></time>
      </section>

      <section className="grid grid-cols-4 gap-4" aria-label="Journey metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={{ ...metric, icon: metricIcons[metric.id] }} />
        ))}
      </section>

      <section className="mt-4 grid grid-cols-[1.08fr_1.08fr_.85fr] gap-4">
        <GlassCard className="flex min-h-[250px] flex-col overflow-hidden p-5">
          <h2 className="text-[15px] font-semibold">Current Focus</h2>
          <div className="mt-5 space-y-5">
            {focusItems.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-[12px]"><span>{item.label}</span><span>{item.progress}%</span></div>
                <ProgressBar value={item.progress} accent={item.accent} label={`${item.label} progress`} />
              </div>
            ))}
          </div>
          <div className="quote-card -mx-5 -mb-5 mt-auto flex min-h-[85px] items-center gap-3 border-t border-violet-400/15 px-6 py-4">
            <Quote className="size-5 shrink-0 fill-violet-500 text-violet-500" />
            <p className="text-[13px] leading-5 text-violet-300">Discipline today, freedom tomorrow.<span className="mt-1 block text-[10px] text-slate-300">— Your Future Self</span></p>
          </div>
        </GlassCard>

        <GlassCard className="flex min-h-[250px] flex-col p-5">
          <SectionTitle icon={Target}>Today&apos;s Mission</SectionTitle>
          <div className="mt-5 space-y-4">
            {missionItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-[12px]">
                <span className={item.completed ? "grid size-[18px] place-items-center rounded-full bg-emerald-500 text-slate-950" : "size-[18px] rounded-full border border-slate-500"}>{item.completed && <Check className="size-3" strokeWidth={3} />}</span>
                <span className="flex-1">{item.label}</span><span className="text-slate-300">{item.duration}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4 text-[12px]"><span>Estimated Time</span><span className="text-violet-300">~ {overview.estimatedTime}</span></div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <SectionTitle icon={BarChart3}>Quick Stats</SectionTitle>
            <div className="mt-4 space-y-3.5">
              {quickStats.map((stat) => { 
                const Icon = quickStatIcons[stat.label] || GitCommitHorizontal; 
                return (
                  <div key={stat.label} className="flex items-center gap-3 text-[11px]">
                    <Icon className="size-4 text-slate-300" />
                    <span className="flex-1 text-slate-300">{stat.label}</span>
                    <span className="text-slate-100">{stat.value}</span>
                  </div>
                ); 
              })}
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 px-5 py-4"><Sparkles className="size-5 text-violet-400" /><p className="text-[12px] leading-5 text-violet-300">Consistency is the<br />ultimate multiplier.</p></GlassCard>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-[1fr_.26fr] gap-4 2xl:grid-cols-1">
        <HeatmapPreview />
        <GlassCard className="flex flex-col justify-center p-5 2xl:hidden">
          <h2 className="flex items-center gap-2 text-sm text-violet-300"><Lightbulb className="size-5 text-amber-300" />Tip of the Day</h2>
          <p className="mt-4 text-sm leading-6 text-slate-100">Focus on building systems, not just solving problems.</p>
          <ProgressBar value={82} accent="violet" className="mt-4" label="Tip progress" />
        </GlassCard>
      </section>
    </PageContainer>
  );
}
