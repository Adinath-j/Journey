import { useEffect, useState, useMemo } from "react";
import { Check, ChevronRight, Edit2, Map, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { cn } from "@/lib/cn";

function RoadmapNode({ node, allNodes, level = 0 }) {
  const { updateNode, deleteNode, addNode } = useRoadmapStore();
  const [expanded, setExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [newTitle, setNewTitle] = useState("");

  const children = useMemo(() => allNodes.filter(n => n.parentId === node._id), [allNodes, node._id]);
  const hasChildren = children.length > 0;

  const handleSaveEdit = () => {
    updateNode(node._id, { title: editTitle });
    setIsEditing(false);
  };

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNode({ title: newTitle, parentId: node._id });
    setNewTitle("");
    setIsAdding(false);
    setExpanded(true);
  };

  const toggleStatus = () => {
    const nextStatus = node.status === "complete" ? "upcoming" : node.status === "active" ? "complete" : "active";
    updateNode(node._id, { status: nextStatus });
  };

  return (
    <div className={cn("relative flex flex-col gap-2", level > 0 && "ml-8 mt-2")}>
      {level > 0 && <div className="absolute -left-6 top-6 h-px w-4 bg-white/10" />}
      {level > 0 && <div className="absolute -left-6 top-0 h-full w-px bg-white/10" />}

      <GlassCard className={cn("relative flex flex-col gap-3 p-4 transition-all duration-200", isEditing && "ring-2 ring-violet-500/50")}>
        <div className="flex items-center gap-4">
          <button onClick={toggleStatus} className={cn("z-10 grid size-10 shrink-0 place-items-center rounded-xl transition-colors", node.status === "complete" ? "bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25" : node.status === "active" ? "bg-violet-400/20 text-violet-300 hover:bg-violet-400/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
            {node.status === "complete" ? <Check className="size-5" /> : <div className="size-2.5 rounded-full bg-current opacity-60" />}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input autoFocus type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()} className="w-full rounded bg-black/30 px-2 py-1 text-sm text-white outline-none" />
            ) : (
              <h2 className={cn("text-sm font-medium", node.status === "complete" && "text-slate-400 line-through")}>{node.title}</h2>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-40 transition-opacity hover:opacity-100">
            <button onClick={() => setIsAdding(!isAdding)} className="p-1 hover:text-white" title="Add Child"><Plus className="size-4" /></button>
            <button onClick={() => setIsEditing(true)} className="p-1 hover:text-white" title="Edit"><Edit2 className="size-3.5" /></button>
            <button onClick={() => deleteNode(node._id)} className="p-1 hover:text-red-400" title="Delete"><Trash2 className="size-4" /></button>
            {hasChildren && (
              <button onClick={() => setExpanded(!expanded)} className="p-1 hover:text-white">
                <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
              </button>
            )}
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleAddChild} className="ml-14 flex items-center gap-2">
            <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New sub-topic..." className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            <Button type="submit" className="h-8 text-xs bg-white/10 hover:bg-white/20">Add</Button>
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs">Cancel</Button>
          </form>
        )}
      </GlassCard>

      {expanded && hasChildren && (
        <div className="flex flex-col">
          {children.map(child => (
            <RoadmapNode key={child._id} node={child} allNodes={allNodes} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  const { nodes, fetchRoadmap, addNode, isLoading } = useRoadmapStore();
  const [newTitle, setNewTitle] = useState("");
  const [isAddingRoot, setIsAddingRoot] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const rootNodes = useMemo(() => nodes.filter(n => !n.parentId), [nodes]);

  const handleAddRoot = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNode({ title: newTitle, parentId: null });
    setNewTitle("");
    setIsAddingRoot(false);
  };

  return (
    <PageContainer>
      <div className="page-heading flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Map />
          <div>
            <h1>Your roadmap</h1>
            <p>Turn ambitious goals into visible, manageable steps.</p>
          </div>
        </div>
        <Button onClick={() => setIsAddingRoot(!isAddingRoot)} className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
          <Plus className="size-4 mr-2" /> New Goal
        </Button>
      </div>

      <div className="mt-8">
        {isAddingRoot && (
          <GlassCard className="mb-6 p-5">
            <form onSubmit={handleAddRoot} className="flex items-center gap-3">
              <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="E.g., Learn Machine Learning..." className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              <Button type="submit" className="bg-violet-500 hover:bg-violet-600">Create</Button>
              <Button type="button" variant="ghost" onClick={() => setIsAddingRoot(false)}>Cancel</Button>
            </form>
          </GlassCard>
        )}

        <div className="flex flex-col gap-4">
          {rootNodes.length === 0 && !isLoading && !isAddingRoot && (
            <div className="py-12 text-center text-slate-400">
              <p className="mb-4">Your roadmap is empty.</p>
              <Button onClick={() => setIsAddingRoot(true)} className="bg-white/5 hover:bg-white/10">Create your first goal</Button>
            </div>
          )}
          {rootNodes.map(node => (
            <RoadmapNode key={node._id} node={node} allNodes={nodes} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
