import { useState, useEffect } from "react";
import { Play, Pause, CheckSquare, Square, Save, X, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useSessionStore } from "@/store/useSessionStore";
import { useLogStore } from "@/store/useLogStore";

export default function StudyWorkspace() {
  const { 
    isActive, 
    topic, 
    isPlaying, 
    notes, 
    completedConcepts, 
    completedProblems,
    togglePlayPause,
    updateNotes,
    toggleConcept,
    toggleProblem,
    getElapsedSeconds,
    minimizeSession,
    endSession
  } = useSessionStore();

  const addLog = useLogStore((state) => state.addLog);
  const isLoading = useLogStore((state) => state.isLoading);

  const [displaySeconds, setDisplaySeconds] = useState(getElapsedSeconds());

  useEffect(() => {
    let interval = null;
    if (isActive) {
      // Sync display timer every second
      interval = setInterval(() => {
        setDisplaySeconds(getElapsedSeconds());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPlaying, getElapsedSeconds]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishSession = async () => {
    if (!topic) return;
    
    // Pause timer before saving
    if (isPlaying) togglePlayPause();
    
    const finalSeconds = getElapsedSeconds();
    
    await addLog({
      title: `Studied: ${topic.title}`,
      category: "General",
      durationMinutes: Math.max(1, Math.round(finalSeconds / 60)),
      topicId: topic._id,
      completedTopic: false, // The user can mark the entire topic as complete in the Roadmap UI later, or we can add a toggle here
      notes: notes,
      conceptsLearned: completedConcepts,
      problemsSolved: completedProblems,
      // difficulty, confidence, resources could be added to a finish modal later
    });

    endSession();
  };

  if (!isActive || !topic) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1524]">
        <div className="flex items-center gap-3 text-slate-300">
          <BookOpen className="size-5 text-violet-400" />
          <span className="font-medium">Active Session: {topic.title}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="font-mono text-2xl font-light tracking-wider text-emerald-400 w-24 text-center">
            {formatTime(displaySeconds)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlayPause} className="bg-white/5 hover:bg-white/10">
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button onClick={handleFinishSession} disabled={isLoading} className="bg-violet-600 hover:bg-violet-500 text-white px-4">
              <Save className="size-4 mr-2" /> {isLoading ? "Saving..." : "Finish Session"}
            </Button>
            <Button variant="ghost" size="icon" onClick={minimizeSession} className="hover:bg-red-500/20 hover:text-red-400 ml-4">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Checklists */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">Concepts Checklist</h2>
              <div className="space-y-3">
                {topic.concepts?.map((c, i) => {
                  // We rely on the true backend state plus the session's optimistic state
                  const isChecked = c.completed || completedConcepts.includes(c.title);
                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        toggleConcept(c.title);
                        // Real-time backend sync
                        import('@/store/useRoadmapStore').then(module => {
                          const newConcepts = topic.concepts.map(concept => 
                            concept.title === c.title ? { ...concept, completed: !isChecked } : concept
                          );
                          module.useRoadmapStore.getState().updateNode(topic._id, { concepts: newConcepts });
                          // Update session snapshot to prevent flicker
                          useSessionStore.setState({ topic: { ...topic, concepts: newConcepts } });
                        });
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
                    >
                      {isChecked ? <CheckSquare className="size-5 text-emerald-400" /> : <Square className="size-5 text-slate-500" />}
                      <span className={isChecked ? "text-slate-400 line-through" : "text-slate-200"}>{c.title}</span>
                    </div>
                  );
                })}
                {!topic.concepts?.length && <p className="text-sm text-slate-500">No concepts defined.</p>}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">Problems Checklist</h2>
              <div className="space-y-3">
                {topic.problems?.map((p, i) => {
                  const isChecked = p.completed || completedProblems.includes(p.title);
                  return (
                    <div 
                      key={i}
                      onClick={() => {
                        toggleProblem(p.title);
                        // Real-time backend sync
                        import('@/store/useRoadmapStore').then(module => {
                          const newProblems = topic.problems.map(prob => 
                            prob.title === p.title ? { ...prob, completed: !isChecked } : prob
                          );
                          module.useRoadmapStore.getState().updateNode(topic._id, { problems: newProblems });
                          // Update session snapshot to prevent flicker
                          useSessionStore.setState({ topic: { ...topic, problems: newProblems } });
                        });
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
                    >
                      {isChecked ? <CheckSquare className="size-5 text-emerald-400" /> : <Square className="size-5 text-slate-500" />}
                      <span className={isChecked ? "text-slate-400 line-through" : "text-slate-200"}>{p.title}</span>
                    </div>
                  );
                })}
                {!topic.problems?.length && <p className="text-sm text-slate-500">No problems defined.</p>}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Notes & Resources */}
          <div className="space-y-6 flex flex-col h-full">
            <GlassCard className="p-6 flex-1 flex flex-col">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider flex justify-between items-center">
                Session Notes
                <span className="text-xs normal-case font-normal text-slate-500">Markdown supported</span>
              </h2>
              <textarea 
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                className="flex-1 w-full bg-black/20 border border-white/5 rounded-lg p-4 text-sm text-slate-200 outline-none focus:border-violet-500/50 resize-none custom-scrollbar"
                placeholder="Jot down key takeaways, bugs encountered, or insights..."
              />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">Helpful Resources</h2>
              <div className="space-y-3 mb-3">
                {topic.resources?.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/5">
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline truncate max-w-[80%]">
                      {r.title}
                    </a>
                    <button 
                      onClick={() => {
                        import('@/store/useRoadmapStore').then(module => {
                          const newResources = topic.resources.filter((_, idx) => idx !== i);
                          module.useRoadmapStore.getState().updateNode(topic._id, { resources: newResources });
                          useSessionStore.setState({ topic: { ...topic, resources: newResources } });
                        });
                      }}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {!topic.resources?.length && <p className="text-sm text-slate-500">No resources linked to this topic.</p>}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="resource-url-input"
                  placeholder="Paste URL to add resource..." 
                  className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (!val) return;
                      // Try to auto-derive a title or use URL
                      let title = val;
                      try { title = new URL(val).hostname.replace('www.', ''); } catch(err) {}
                      
                      import('@/store/useRoadmapStore').then(module => {
                        const newResources = [...(topic.resources || []), { title, url: val, type: "other" }];
                        module.useRoadmapStore.getState().updateNode(topic._id, { resources: newResources });
                        useSessionStore.setState({ topic: { ...topic, resources: newResources } });
                      });
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
