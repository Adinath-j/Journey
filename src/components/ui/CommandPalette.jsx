import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { Search, Map, Play, ArrowRight, Settings, Calendar, Activity, BookOpen, FileText, Link as LinkIcon, Home, Plus } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useLogStore } from "@/store/useLogStore";
import { useAppStore } from "@/store/useAppStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { todaysPlan, hero } = useDashboardStore();
  const { nodes, fetchRoadmap } = useRoadmapStore();
  const { logs, fetchLogs } = useLogStore();
  const setActivePage = useAppStore(state => state.setActivePage);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => {
          if (!open) {
            fetchRoadmap();
            fetchLogs();
          }
          return !open;
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [fetchRoadmap, fetchLogs]);

  // Extract resources and notes
  const resources = useMemo(() => {
    const res = [];
    nodes.forEach(n => {
      n.resources?.forEach(r => res.push({ title: r.title || r.url, url: r.url, source: n.title, id: `n-res-${n._id}-${r.url}` }));
    });
    logs.forEach(l => {
      l.resources?.forEach(r => res.push({ title: r, url: r, source: l.title, id: `l-res-${l._id}-${r}` }));
    });
    return res;
  }, [nodes, logs]);

  const notes = useMemo(() => {
    const nts = [];
    nodes.forEach(n => {
      if (n.notes) nts.push({ text: n.notes, source: n.title, id: `n-note-${n._id}`, type: 'topic' });
    });
    logs.forEach(l => {
      if (l.notes) nts.push({ text: l.notes, source: l.title, id: `l-note-${l._id}`, type: 'log' });
    });
    return nts;
  }, [nodes, logs]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <Command 
        className="w-full max-w-2xl bg-[#0f1524] rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[70vh]"
        onKeyDown={(e) => {
          if (e.key === "Escape" || (e.key === "c" && e.ctrlKey)) {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <div className="flex items-center border-b border-white/5 px-4 bg-black/20">
          <Search className="size-5 text-slate-500 shrink-0" />
          <Command.Input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none py-4 px-3 text-slate-200 placeholder:text-slate-500 font-medium text-lg"
            placeholder="Search topics, logs, notes, resources, or commands..." 
          />
          <div className="text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5 font-mono">ESC</div>
        </div>

        <Command.List className="overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-10 text-center text-sm text-slate-500">
            No results found for your search.
          </Command.Empty>

          <Command.Group heading="Active Topics" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2">
            {hero && (
              <Command.Item 
                value={`resume ${hero.title}`}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-violet-500/10 data-[selected=true]:text-violet-200 cursor-pointer transition-colors"
                onSelect={() => { setOpen(false); setActivePage('dashboard'); }}
              >
                <div className="size-6 rounded bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Play className="size-3 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200">Resume: {hero.title}</p>
                </div>
                <ArrowRight className="size-4 opacity-50" />
              </Command.Item>
            )}
            {todaysPlan?.map(topic => (
              <Command.Item 
                key={`plan-${topic.id}`}
                value={`plan ${topic.title}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors mt-1"
                onSelect={() => { setOpen(false); setActivePage('roadmap'); }}
              >
                <Map className="size-4 text-slate-500" />
                <span className="flex-1">{topic.title}</span>
                {topic.priorityScore && <span className="text-[10px] text-violet-400">{topic.priorityScore} Pts</span>}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Topics" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2 mt-2 border-t border-white/5">
            {nodes.map(node => (
              <Command.Item 
                key={node._id}
                value={`topic ${node.title} ${node.description}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors"
                onSelect={() => { setOpen(false); setActivePage('roadmap'); }}
              >
                <Map className="size-4 text-violet-400" /> 
                <span className="flex-1">{node.title}</span>
                <span className="text-[10px] text-slate-500">{node.status}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Study Sessions" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2 mt-2 border-t border-white/5">
            {logs.map(log => (
              <Command.Item 
                key={log._id}
                value={`session log ${log.title} ${log.category}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors"
                onSelect={() => { setOpen(false); setActivePage('log'); }}
              >
                <BookOpen className="size-4 text-emerald-400" /> 
                <span className="flex-1">{log.title}</span>
                <span className="text-[10px] text-slate-500">{new Date(log.date).toLocaleDateString()}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Notes" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2 mt-2 border-t border-white/5">
            {notes.map(note => (
              <Command.Item 
                key={note.id}
                value={`note ${note.text} ${note.source}`}
                className="flex flex-col items-start px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors"
                onSelect={() => { setOpen(false); setActivePage(note.type === 'topic' ? 'roadmap' : 'log'); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-3 text-orange-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{note.source}</span>
                </div>
                <span className="text-slate-200 line-clamp-1 italic">"{note.text}"</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Resources" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2 mt-2 border-t border-white/5">
            {resources.map(res => (
              <Command.Item 
                key={res.id}
                value={`resource ${res.title} ${res.url} ${res.source}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors"
                onSelect={() => { window.open(res.url, "_blank"); setOpen(false); }}
              >
                <LinkIcon className="size-4 text-blue-400" /> 
                <span className="flex-1 truncate">{res.title}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{res.source}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Commands" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-2 mt-2 border-t border-white/5">
            <Command.Item value="command go to dashboard home" onSelect={() => { setActivePage('dashboard'); setOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors">
              <Home className="size-4 text-slate-400" /> Go to Dashboard
            </Command.Item>
            <Command.Item value="command go to roadmap" onSelect={() => { setActivePage('roadmap'); setOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors">
              <Map className="size-4 text-slate-400" /> Go to Roadmap Explorer
            </Command.Item>
            <Command.Item value="command go to log study session" onSelect={() => { setActivePage('log'); setOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors">
              <BookOpen className="size-4 text-slate-400" /> View Study Logs
            </Command.Item>
            <Command.Item value="command go to heatmap activity" onSelect={() => { setActivePage('heatmap'); setOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors">
              <Activity className="size-4 text-slate-400" /> View Heatmap
            </Command.Item>
            <Command.Item value="command new roadmap topic" onSelect={() => { setActivePage('roadmap'); setOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 data-[selected=true]:bg-white/5 cursor-pointer transition-colors">
              <Plus className="size-4 text-slate-400" /> Create New Topic
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
