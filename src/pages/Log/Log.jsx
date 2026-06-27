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
  const [difficulty, setDifficulty] = useState("");
  const [confidence, setConfidence] = useState("");
  const [problemsSolved, setProblemsSolved] = useState("");
  const [conceptsLearned, setConceptsLearned] = useState("");
  const [resources, setResources] = useState("");

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
      difficulty,
      confidence: confidence ? Number(confidence) : undefined,
      problemsSolved: problemsSolved.split(',').map(s => s.trim()).filter(Boolean),
      conceptsLearned: conceptsLearned.split(',').map(s => s.trim()).filter(Boolean),
      resources: resources.split(',').map(s => s.trim()).filter(Boolean),
    });
    setShowForm(false);
    setTitle("");
    setNotes("");
    setDifficulty("");
    setConfidence("");
    setProblemsSolved("");
    setConceptsLearned("");
    setResources("");
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
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none [&>option]:bg-[#0b1120]">
                  <option value="General">General</option>
                  <option value="DSA">DSA</option>
                  <option value="React">React</option>
                  <option value="Backend">Backend</option>
                  <option value="System Design">System Design</option>
                  <option value="GenAI">GenAI</option>
                  <option value="Custom">Custom...</option>
                </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none [&>option]:bg-[#0b1120]">
                  <option value="">Select...</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Confidence (1-5)</label>
                <input type="number" min="1" max="5" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="1-5" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Problems Solved (comma separated)</label>
              <input type="text" value={problemsSolved} onChange={(e) => setProblemsSolved(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="Two Sum, Reverse Linked List..." />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Concepts Learned (comma separated)</label>
              <input type="text" value={conceptsLearned} onChange={(e) => setConceptsLearned(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="Recursion, Event Loop..." />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Resources (comma separated URLs)</label>
              <input type="text" value={resources} onChange={(e) => setResources(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none" placeholder="https://..." />
            </div>

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
          <LogCard key={entry._id} entry={entry} formatDate={formatDate} formatDuration={formatDuration} />
        ))}
      </div>
    </PageContainer>
  );
}

function LogCard({ entry, formatDate, formatDuration }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard interactive={false} className="flex flex-col p-5 cursor-pointer transition-all hover:bg-white/[0.02]" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center gap-5">
        <span className="w-20 text-xs text-slate-400 shrink-0">{formatDate(entry.date)}</span>
        <div className="flex-1">
          <h2 className="text-sm font-medium">{entry.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="inline-block text-[10px] uppercase tracking-widest text-violet-300">{entry.category}</span>
            {entry.topicId && entry.completedTopic && <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Topic Completed</span>}
            {entry.difficulty && <span className="text-[10px] uppercase tracking-widest text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">{entry.difficulty}</span>}
            {entry.confidence && <span className="text-[10px] uppercase tracking-widest text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">Conf: {entry.confidence}/5</span>}
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-300 shrink-0"><Clock3 className="size-4" />{formatDuration(entry.durationMinutes)}</span>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4 pl-[100px] text-sm text-slate-300 cursor-default" onClick={e => e.stopPropagation()}>
          {entry.notes && (
            <div>
              <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Notes</strong>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
          
          {entry.conceptsLearned?.length > 0 && (
            <div>
              <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Concepts</strong>
              <div className="flex flex-wrap gap-2">
                {entry.conceptsLearned.map((c, i) => <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs">{c}</span>)}
              </div>
            </div>
          )}

          {entry.problemsSolved?.length > 0 && (
            <div>
              <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Problems</strong>
              <div className="flex flex-wrap gap-2">
                {entry.problemsSolved.map((p, i) => <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs">{p}</span>)}
              </div>
            </div>
          )}

          {entry.resources?.length > 0 && (
            <div>
              <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Resources</strong>
              <ul className="list-disc list-inside space-y-1">
                {entry.resources.map((r, i) => (
                  <li key={i}><a href={r} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">{r}</a></li>
                ))}
              </ul>
            </div>
          )}

          {!entry.notes && !entry.conceptsLearned?.length && !entry.problemsSolved?.length && !entry.resources?.length && (
            <p className="text-slate-500 italic text-xs">No additional details recorded for this session.</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}