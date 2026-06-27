import { useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Activity, BarChart3, AlertTriangle, Clock, Calendar, Zap } from "lucide-react";
import { useLogStore } from "@/store/useLogStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export default function Analytics() {
  const { logs, fetchLogs } = useLogStore();
  const { nodes, fetchRoadmap } = useRoadmapStore();

  useEffect(() => {
    fetchLogs();
    if (nodes.length === 0) fetchRoadmap();
  }, [fetchLogs, fetchRoadmap, nodes.length]);

  // 1. Weekly Consistency (Last 7 Days)
  const weeklyConsistency = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let maxMinutes = 1; // Prevent divide by zero

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      
      const dayLogs = logs.filter(l => l.date.startsWith(dayStr));
      const totalMinutes = dayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
      
      if (totalMinutes > maxMinutes) maxMinutes = totalMinutes;
      
      days.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: totalMinutes,
        hours: (totalMinutes / 60).toFixed(1)
      });
    }
    
    return { days, maxMinutes };
  }, [logs]);

  // 2. Topic Distribution
  const topicDistribution = useMemo(() => {
    const dist = {};
    logs.forEach(l => {
      dist[l.category] = (dist[l.category] || 0) + l.durationMinutes;
    });
    
    const sorted = Object.entries(dist)
      .map(([cat, mins]) => ({ category: cat, hours: (mins / 60).toFixed(1), mins }))
      .sort((a, b) => b.mins - a.mins);
      
    const totalMins = sorted.reduce((acc, curr) => acc + curr.mins, 0) || 1;
    return { categories: sorted, totalMins };
  }, [logs]);

  // 3. Weak Areas
  const weakAreas = useMemo(() => {
    const weakMap = new Map();
    // Only look at last 30 days for relevance
    const recentLogs = logs.filter(l => (new Date() - new Date(l.date)) / (1000 * 60 * 60 * 24) < 30);
    
    recentLogs.forEach(l => {
      if (l.topicId && (l.confidence <= 2 || l.difficulty === "Hard")) {
        const node = nodes.find(n => n._id === l.topicId);
        if (node) {
          weakMap.set(l.topicId, {
            title: node.title,
            confidence: l.confidence,
            difficulty: l.difficulty,
            date: l.date
          });
        }
      } else if (l.topicId && l.confidence >= 4) {
        // If they recently scored high, remove from weak map
        weakMap.delete(l.topicId);
      }
    });
    
    return Array.from(weakMap.values()).slice(0, 5); // Top 5
  }, [logs, nodes]);

  // 4. Revision Due
  const revisionDue = useMemo(() => {
    const activeNodes = nodes.filter(n => n.status === "active");
    const due = [];
    
    activeNodes.forEach(node => {
      const nodeLogs = logs.filter(l => l.topicId === node._id).sort((a, b) => new Date(b.date) - new Date(a.date));
      if (nodeLogs.length > 0) {
        const lastStudied = new Date(nodeLogs[0].date);
        const daysSince = Math.floor((new Date() - lastStudied) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7) {
          due.push({ title: node.title, daysSince });
        }
      }
    });
    return due.sort((a, b) => b.daysSince - a.daysSince).slice(0, 5);
  }, [logs, nodes]);

  // 5. Estimated Completion
  const estimatedCompletion = useMemo(() => {
    // calculate average hours per week over the last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentLogs = logs.filter(l => new Date(l.date) >= fourWeeksAgo);
    const recentMinutes = recentLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    const hoursPerWeek = (recentMinutes / 60) / 4 || 1; // Default to 1 to avoid infinity
    
    // Total remaining estimated hours
    // Assuming nodes have estimatedHours (fallback to 2 if not present)
    const pendingNodes = nodes.filter(n => n.status !== "completed");
    const remainingHours = pendingNodes.reduce((acc, n) => acc + (n.estimatedHours || 2), 0);
    
    const weeksRemaining = remainingHours / hoursPerWeek;
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksRemaining * 7));
    
    return {
      hoursPerWeek: hoursPerWeek.toFixed(1),
      remainingHours,
      completionDate: completionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      isRealistic: hoursPerWeek > 5
    };
  }, [logs, nodes]);

  return (
    <PageContainer>
      <div className="page-heading flex items-center gap-4">
        <BarChart3 />
        <div>
          <h1>Analytics</h1>
          <p>Actionable insights derived from your study habits.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* Weekly Consistency */}
        <GlassCard className="col-span-2 p-6">
          <SectionTitle icon={Activity}>Weekly Consistency</SectionTitle>
          <div className="h-48 flex items-end justify-between mt-6 px-4">
            {weeklyConsistency.days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group">
                <div className="relative w-12 flex flex-col justify-end h-32 bg-black/20 rounded-t-lg border border-white/5 overflow-hidden">
                  <div 
                    className="w-full bg-violet-500/80 rounded-t-sm transition-all duration-500 group-hover:bg-violet-400"
                    style={{ height: `${(day.minutes / weeklyConsistency.maxMinutes) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">{day.date}</span>
                  <span className="text-[10px] font-bold text-violet-300 mt-1">{day.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Estimated Completion */}
        <GlassCard className="col-span-1 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
             <Calendar className="size-32" />
          </div>
          <div>
            <SectionTitle icon={Zap}>Velocity & Projection</SectionTitle>
            <div className="mt-6 space-y-4 relative z-10">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Current Velocity</span>
                <span className="text-2xl font-bold text-emerald-400">{estimatedCompletion.hoursPerWeek} <span className="text-sm font-medium text-emerald-500/70">hrs/week</span></span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Remaining Effort</span>
                <span className="text-xl font-bold text-slate-200">{estimatedCompletion.remainingHours} <span className="text-sm font-medium text-slate-500">hours</span></span>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 relative z-10">
            <span className="text-[10px] uppercase text-violet-300 font-semibold tracking-wider block mb-1">Projected Completion</span>
            <span className="text-lg font-bold text-white">{estimatedCompletion.completionDate}</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Topic Distribution */}
        <GlassCard className="col-span-1 p-6">
           <SectionTitle icon={BarChart3}>Topic Distribution</SectionTitle>
           <div className="mt-6 space-y-5">
             {topicDistribution.categories.map((cat, i) => (
               <div key={i}>
                 <div className="flex justify-between text-xs mb-2">
                   <span className="text-slate-200 font-medium">{cat.category}</span>
                   <span className="text-slate-400">{cat.hours}h</span>
                 </div>
                 <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-500/80 rounded-full" 
                     style={{ width: `${(cat.mins / topicDistribution.totalMins) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
             {topicDistribution.categories.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No category data available.</p>}
           </div>
        </GlassCard>

        {/* Weak Areas */}
        <GlassCard className="col-span-1 p-6">
           <SectionTitle icon={AlertTriangle}>Targeted Weak Areas</SectionTitle>
           <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 mb-5">Low confidence or high difficulty</p>
           <div className="space-y-3">
             {weakAreas.length > 0 ? weakAreas.map((area, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-red-500/10">
                 <span className="text-sm text-slate-200 truncate max-w-[150px]" title={area.title}>{area.title}</span>
                 <div className="flex items-center gap-2 shrink-0">
                   {area.difficulty === "Hard" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">HARD</span>}
                   {area.confidence && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">LVL {area.confidence}</span>}
                 </div>
               </div>
             )) : (
               <p className="text-sm text-emerald-500/70 py-4 text-center">No weak areas identified recently. Great job!</p>
             )}
           </div>
        </GlassCard>

        {/* Revision Due */}
        <GlassCard className="col-span-1 p-6">
           <SectionTitle icon={Clock}>Revision Due</SectionTitle>
           <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 mb-5">Active topics neglected {'>'} 7 days</p>
           <div className="space-y-3">
             {revisionDue.length > 0 ? revisionDue.map((rev, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-orange-500/10">
                 <span className="text-sm text-slate-200 truncate max-w-[160px]" title={rev.title}>{rev.title}</span>
                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium shrink-0">{rev.daysSince}d ago</span>
               </div>
             )) : (
               <p className="text-sm text-emerald-500/70 py-4 text-center">All active topics are fresh in memory!</p>
             )}
           </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
