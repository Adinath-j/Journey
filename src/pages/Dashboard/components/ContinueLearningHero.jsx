import { Calendar, ChevronRight, Clock, Map, Play, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useDashboardStore } from "@/store/useDashboardStore";

export function ContinueLearningHero({ hero }) {
  const setActivePage = useAppStore(state => state.setActivePage);

  if (!hero) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent h-full">
        <Map className="size-12 text-violet-400 mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-slate-100 mb-2">Your journey awaits</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">Import a roadmap or create your first topic to unlock your learning workspace.</p>
        <Button onClick={() => setActivePage('roadmap')} className="bg-violet-500 hover:bg-violet-600">Create a Roadmap</Button>
      </GlassCard>
    );
  }

  const { title, breadcrumb, progress, estimatedRemaining, lastStudied } = hero;

  return (
    <GlassCard className="relative overflow-hidden p-6 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent min-h-[280px] flex flex-col">
      {/* Decorative background element */}
      <div className="absolute right-0 top-0 w-64 h-full opacity-[0.03] pointer-events-none flex items-center justify-end pr-10">
        <Map className="size-48" />
      </div>

      <div className="flex items-center gap-2 text-violet-300 mb-4 z-10">
        <Map className="size-4" />
        <span className="text-sm font-medium tracking-wide">Continue Learning</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 z-10 font-medium">
        {breadcrumb.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <span className="truncate max-w-[120px]">{crumb}</span>
            <ChevronRight className="size-3 text-slate-600" />
          </span>
        ))}
        <span className="text-slate-200 truncate">{title}</span>
      </div>

      <div className="flex gap-8 mb-auto z-10">
        {/* Progress Circle approximation */}
        <div className="relative size-20 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <path className="stroke-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <path className="stroke-violet-500 transition-all duration-1000 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-white">{progress}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-slate-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Estimated Remaining</p>
              <p className="text-sm text-slate-200">{estimatedRemaining}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-slate-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Last Studied</p>
              <p className="text-sm text-slate-200">
                {lastStudied ? (
                  new Date(lastStudied).toDateString() === new Date().toDateString() ? "Today" : 
                  new Date(lastStudied).toDateString() === new Date(Date.now() - 86400000).toDateString() ? "Yesterday" :
                  new Date(lastStudied).toLocaleDateString()
                ) : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 z-10">
        <Button 
          onClick={() => {
            const currentTopic = useDashboardStore.getState().currentTopic;
            if (useSessionStore.getState().isActive && useSessionStore.getState().topic?._id === currentTopic._id) {
              useSessionStore.getState().resumeSession();
            } else {
              useSessionStore.getState().startSession(currentTopic);
            }
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 px-6"
        >
          <Play className="size-4 mr-2 fill-current" /> Continue Session
        </Button>
        <Button variant="ghost" onClick={() => useAppStore.getState().setActivePage('log')} className="bg-white/5 hover:bg-white/10 px-6">
          <CheckCircle className="size-4 mr-2 text-slate-400" /> Log Progress
        </Button>
      </div>
    </GlassCard>
  );
}
