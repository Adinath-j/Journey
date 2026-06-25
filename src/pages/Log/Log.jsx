import { useEffect, useState } from "react";
import { BookOpen, Clock3, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useLogStore } from "@/store/useLogStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export default function Log() {
  const { logs, fetchLogs, addLog, isLoading } = useLogStore();
  const { nodes, fetchRoadmap } = useRoadmapStore();
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [topicId, setTopicId] = useState("");
  const [completedTopic, setCompletedTopic] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchLogs();
    if (nodes.length === 0) fetchRoadmap();
  }, [fetchLogs, fetchRoadmap, nodes.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addLog({
      title,
      category,
      durationMinutes: Number(durationMinutes),
      topicId: topicId || null,
      completedTopic,
      notes,
    });
    setShowForm(false);
    setTitle("");
    setNotes("");
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (d.toDateString() === new Date().toDateString()) return "Today";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  return (
    <PageContainer>
      <div className="page-heading flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BookOpen />
          <div>
            <h1>Study log</h1>
            <p>The work adds up. Here is the proof.</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
          <Plus className="size-4 mr-2" /> Log Session
        </Button>
      </div>

      {showForm && (
        <GlassCard className="mt-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Session Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="e.g. Practiced Binary Trees" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="DSA, Frontend, etc." />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Duration (Minutes)</label>
                <input required type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Attach to Roadmap Topic (Optional)</label>
                <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none [&>option]:bg-[#0b1120]">
                  <option value="">None</option>
                  {nodes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)}
                </select>
              </div>
            </div>

            {topicId && (
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={completedTopic} onChange={(e) => setCompletedTopic(e.target.checked)} className="rounded border-white/20 bg-black/20 text-violet-500 focus:ring-violet-500/50" />
                I completed this topic!
              </label>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" rows="2" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-violet-500 hover:bg-violet-600">{isLoading ? "Saving..." : "Save Log"}</Button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="mt-8 space-y-3">
        {logs.length === 0 && !isLoading && <p className="text-sm text-slate-400 py-10 text-center">No study logs yet. Start your journey today!</p>}
        {logs.map((entry) => (
          <GlassCard key={entry._id} interactive className="flex items-center gap-5 p-5">
            <span className="w-20 text-xs text-slate-400">{formatDate(entry.date)}</span>
            <div className="flex-1">
              <h2 className="text-sm font-medium">{entry.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-block text-[10px] uppercase tracking-widest text-violet-300">{entry.category}</span>
                {entry.topicId && entry.completedTopic && <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Topic Completed</span>}
              </div>
            </div>
            <span className="flex items-center gap-2 text-xs text-slate-300"><Clock3 className="size-4" />{formatDuration(entry.durationMinutes)}</span>
          </GlassCard>
        ))}
      </div>
    </PageContainer>
  );
}
