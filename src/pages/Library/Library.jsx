import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Library as LibraryIcon, Youtube, Github, FileText, File, ExternalLink, Link as LinkIcon, Filter } from "lucide-react";
import { useLogStore } from "@/store/useLogStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { cn } from "@/lib/cn";

export default function Library() {
  const { logs, fetchLogs } = useLogStore();
  const { nodes, fetchRoadmap } = useRoadmapStore();
  
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchLogs();
    if (nodes.length === 0) fetchRoadmap();
  }, [fetchLogs, fetchRoadmap, nodes.length]);

  // Extraction Engine
  const resources = useMemo(() => {
    const extracted = [];
    
    const determineType = (url) => {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "YouTube";
      if (lowerUrl.includes("github.com")) return "GitHub";
      if (lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?")) return "PDF";
      return "Docs";
    };

    const getIcon = (type) => {
      switch (type) {
        case "YouTube": return <Youtube className="size-4 text-red-500" />;
        case "GitHub": return <Github className="size-4 text-slate-300" />;
        case "PDF": return <FileText className="size-4 text-orange-500" />;
        default: return <File className="size-4 text-blue-400" />;
      }
    };

    // 1. Extract from Roadmap Nodes
    nodes.forEach(n => {
      if (n.resources && n.resources.length > 0) {
        n.resources.forEach(r => {
          const url = typeof r === 'string' ? r : (r.url || "");
          const title = typeof r === 'string' ? url : (r.title || url);
          if (!url) return;
          const type = determineType(url);
          extracted.push({
            id: `n-${n._id}-${url}`,
            topicId: n._id,
            topicTitle: n.title,
            url,
            title,
            type,
            icon: getIcon(type)
          });
        });
      }
    });

    // 2. Extract from Logs
    logs.forEach(l => {
      if (l.resources && l.resources.length > 0) {
        const topicName = l.topicId ? nodes.find(n => n._id === l.topicId)?.title || "General" : "General";
        
        l.resources.forEach(url => {
          if (!url || typeof url !== 'string') return;
          const type = determineType(url);
          
          // Avoid exact duplicates under the same topic
          if (!extracted.some(e => e.url === url && e.topicTitle === topicName)) {
            extracted.push({
              id: `l-${l._id}-${url}`,
              topicId: l.topicId || "general",
              topicTitle: topicName,
              url,
              title: url,
              type,
              icon: getIcon(type)
            });
          }
        });
      }
    });

    return extracted;
  }, [logs, nodes]);

  // Grouping by Topic
  const groupedResources = useMemo(() => {
    const filtered = filter === "All" ? resources : resources.filter(r => r.type === filter);
    
    const groups = {};
    filtered.forEach(r => {
      if (!groups[r.topicTitle]) groups[r.topicTitle] = [];
      groups[r.topicTitle].push(r);
    });
    
    // Sort keys alphabetically but keep 'General' at the end
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === "General") return 1;
        if (b === "General") return -1;
        return a.localeCompare(b);
      })
      .map(key => ({
        topicTitle: key,
        items: groups[key]
      }));
  }, [resources, filter]);

  return (
    <PageContainer>
      <div className="page-heading flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LibraryIcon />
          <div>
            <h1>Resource Library</h1>
            <p>Automatically extracted from your roadmap and study logs.</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-black/20 border border-white/10 rounded-xl">
          <Filter className="size-4 text-slate-500 mx-2" />
          {["All", "YouTube", "GitHub", "Docs", "PDF"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {groupedResources.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="size-8 opacity-20" />
            </div>
            <p className="text-sm">No resources found for this filter.</p>
          </div>
        )}

        {groupedResources.map((group) => (
          <div key={group.topicTitle}>
            <div className="flex items-center gap-3 mb-4">
               <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{group.topicTitle}</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((res) => (
                <a 
                  key={res.id} 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <GlassCard interactive className="p-4 flex items-start gap-4 h-full border border-white/5 hover:border-white/10">
                    <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-black/30 border border-white/5">
                      {res.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-tight group-hover:text-white transition-colors">
                        {res.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-1.5 flex items-center gap-1.5">
                        <ExternalLink className="size-3" />
                        {new URL(res.url).hostname}
                      </p>
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
