import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDashboardStore } from "@/store/useDashboardStore";

import { ContinueLearningHero } from "./components/ContinueLearningHero";
import { WeeklyProgressCard } from "./components/WeeklyProgressCard";
import { TodaysPlanCard } from "./components/TodaysPlanCard";
import { CurrentTopicCard } from "./components/CurrentTopicCard";
import { RemainingTopicsCard } from "./components/RemainingTopicsCard";
import { RecentActivityCard } from "./components/RecentActivityCard";
import { LearningTimelineCard } from "./components/LearningTimelineCard";
import { HeatmapCard } from "./components/HeatmapCard";

export default function Dashboard() {
  const { 
    userName, 
    hero, 
    weeklyProgress, 
    todaysPlan, 
    currentTopic, 
    remainingTopics, 
    recentActivity, 
    timeline, 
    heatmap, 
    fetchDashboard, 
    isLoading 
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading || !userName) {
    return <PageContainer><div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Loading your learning workspace…</div></PageContainer>;
  }

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <PageContainer>
      {/* Header */}
      <header className="mb-6 flex items-start justify-between px-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Good evening, {userName}! <span aria-hidden="true">👋</span></h1>
          <p className="mt-1 text-sm text-slate-400">Let&apos;s continue your learning journey.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Ctrl + K
          </div>
          <div className="flex flex-col items-end pt-1">
            <time className="text-xs text-slate-400">{dateStr}</time>
            <strong className="text-lg font-normal tracking-wide text-slate-200">{timeStr}</strong>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4 mb-4">
        <ContinueLearningHero hero={hero} />
        
        <div className="grid grid-rows-2 gap-4">
          <WeeklyProgressCard weeklyProgress={weeklyProgress} />
          <TodaysPlanCard todaysPlan={todaysPlan} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.5fr_1fr] gap-4 mb-4">
        <CurrentTopicCard currentTopic={currentTopic} />
        <RemainingTopicsCard remainingTopics={remainingTopics} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-[1fr_1.5fr_2.5fr] gap-4">
        <RecentActivityCard recentActivity={recentActivity} />
        <LearningTimelineCard timeline={timeline} />
        <HeatmapCard heatmapData={heatmap} />
      </div>
    </PageContainer>
  );
}
