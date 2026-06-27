import { useEffect, useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Map, Plus, Trash2, Clock, CheckCircle2, Circle, BookOpen, Link as LinkIcon, Save, Lock } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { cn } from "@/lib/cn";
import { ImportModal } from "@/components/roadmap/ImportModal";

function TreeNode({ node, allNodes, level = 0, selectedNodeId, onSelect, onNodeDrop }) {
  const [expanded, setExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState(null);
  
  const children = useMemo(() => allNodes.filter(n => n.parentId === node._id).sort((a,b) => a.order - b.order), [allNodes, node._id]);
  const hasChildren = children.length > 0;
  const isSelected = selectedNodeId === node._id;

  const isLocked = useMemo(() => {
    return node.dependencies?.some(depId => {
      const depNode = allNodes.find(n => n._id === depId);
      return depNode && depNode.status !== "complete";
    });
  }, [node.dependencies, allNodes]);

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("nodeId", node._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    if (y < rect.height * 0.25) {
      setDropPosition("before");
    } else if (y > rect.height * 0.75) {
      setDropPosition("after");
    } else {
      setDropPosition("inside");
    }
  };

  const handleDragLeave = (e) => {
    setDropPosition(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);
    const draggedId = e.dataTransfer.getData("nodeId");
    if (draggedId && draggedId !== node._id) {
      onNodeDrop(draggedId, node._id, dropPosition);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelect(node._id)}
        className={cn(
          "group flex items-center gap-2 py-1.5 pr-2 rounded-md cursor-pointer text-sm transition-colors border border-transparent",
          isSelected ? "bg-violet-500/20 text-violet-200" : "hover:bg-white/5 text-slate-300",
          dropPosition === "inside" && "bg-violet-500/30 ring-1 ring-violet-500",
          dropPosition === "before" && "border-t-violet-500 rounded-none",
          dropPosition === "after" && "border-b-violet-500 rounded-none"
        )}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className={cn("p-0.5 hover:bg-white/10 rounded transition-colors text-slate-500 group-hover:text-slate-300", !hasChildren && "invisible")}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>
        
        {isLocked ? (
          <Lock className="size-3.5 text-slate-600 shrink-0" />
        ) : node.status === "complete" ? (
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
        ) : node.status === "active" ? (
          <Circle className="size-3.5 text-violet-400 shrink-0 fill-violet-400/20" />
        ) : (
          <Circle className="size-3.5 text-slate-500 shrink-0" />
        )}
        
        <span className={cn(
          "truncate", 
          node.status === "complete" && "text-slate-500 line-through",
          isLocked && "text-slate-600 italic"
        )}>
          {node.title}
        </span>
      </div>

      {expanded && hasChildren && (
        <div className="flex flex-col relative before:absolute before:left-[17px] before:top-0 before:bottom-0 before:w-px before:bg-white/10" style={{ marginLeft: `${level * 16}px` }}>
          {children.map(child => (
            <TreeNode 
              key={child._id} 
              node={child} 
              allNodes={allNodes} 
              level={level + 1} 
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              onNodeDrop={onNodeDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeDetails({ node, allNodes }) {
  const { updateNode, deleteNode, addNode } = useRoadmapStore();
  const [title, setTitle] = useState(node.title);
  const [estimatedHours, setEstimatedHours] = useState(node.estimatedHours || 1);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newConcept, setNewConcept] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [importance, setImportance] = useState(node.importance || 5);
  const [frequency, setFrequency] = useState(node.frequency || "none");

  // Reset local state when selected node changes
  useEffect(() => {
    setTitle(node.title);
    setEstimatedHours(node.estimatedHours || 1);
    setImportance(node.importance || 5);
    setFrequency(node.frequency || "none");
    setIsAddingChild(false);
    setNewConcept("");
    setNewProblem("");
  }, [node]);

  const handleSave = () => {
    updateNode(node._id, { title, estimatedHours, importance, frequency });
  };

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newChildTitle.trim()) return;
    addNode({ title: newChildTitle, parentId: node._id });
    setNewChildTitle("");
    setIsAddingChild(false);
  };

  const toggleStatus = () => {
    const nextStatus = node.status === "complete" ? "upcoming" : node.status === "active" ? "complete" : "active";
    updateNode(node._id, { status: nextStatus });
  };

  const children = allNodes.filter(n => n.parentId === node._id).sort((a,b) => a.order - b.order);
  const availableDependencies = allNodes.filter(n => n._id !== node._id && n.parentId !== node._id); // basic filter

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-8">
      {/* Header section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Topic title..."
            className="text-2xl font-semibold bg-black/20 border border-white/5 outline-none text-white w-full hover:border-violet-500/30 focus:border-violet-500/50 focus:bg-black/40 p-2 -ml-2 rounded-lg transition-all"
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            onClick={toggleStatus}
            className={cn(
              node.status === "complete" ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20" :
              node.status === "active" ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/20" :
              "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            )}
          >
            {node.status === "complete" ? "Completed" : node.status === "active" ? "Active" : "Mark Active"}
          </Button>
          <Button variant="ghost" onClick={() => deleteNode(node._id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 px-3">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Properties section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            <Clock className="size-3.5" /> Est. Hours
          </label>
          <input 
            type="number" 
            min="1"
            value={estimatedHours} 
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
            onBlur={handleSave}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-violet-500/50"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Importance (1-10)
          </label>
          <input 
            type="number" 
            min="1"
            max="10"
            value={importance} 
            onChange={(e) => setImportance(Number(e.target.value))}
            onBlur={handleSave}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-violet-500/50"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Review Freq.
          </label>
          <select 
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value);
              updateNode(node._id, { frequency: e.target.value });
            }}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-violet-500/50"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            <Lock className="size-3.5" /> Prerequisites
          </label>
          <select 
            multiple
            value={node.dependencies || []}
            onChange={(e) => {
              const deps = Array.from(e.target.selectedOptions, option => option.value);
              updateNode(node._id, { dependencies: deps });
            }}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-sm text-slate-300 outline-none focus:border-violet-500/50 custom-scrollbar h-24"
          >
            {availableDependencies.map(dep => (
              <option key={dep._id} value={dep._id}>{dep.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklists section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concepts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Concepts</label>
          </div>
          <div className="space-y-2 mb-3">
            {node.concepts?.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/5">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    const newConcepts = node.concepts.map((concept, idx) => idx === i ? { ...concept, completed: !concept.completed } : concept);
                    updateNode(node._id, { concepts: newConcepts });
                  }}
                >
                  {c.completed ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Circle className="size-4 text-slate-500" />}
                  <span className={cn("text-sm", c.completed ? "text-slate-500 line-through" : "text-slate-300")}>{c.title}</span>
                </div>
                <button 
                  onClick={() => {
                    const newConcepts = node.concepts.filter((_, idx) => idx !== i);
                    updateNode(node._id, { concepts: newConcepts });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newConcept.trim()) return;
              const concepts = [...(node.concepts || []), { title: newConcept.trim(), completed: false }];
              updateNode(node._id, { concepts });
              setNewConcept("");
            }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              value={newConcept} 
              onChange={(e) => setNewConcept(e.target.value)} 
              placeholder="Add concept..." 
              className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500/50"
            />
            <Button type="submit" size="sm" className="bg-white/10 hover:bg-white/20 h-auto px-3"><Plus className="size-3" /></Button>
          </form>
        </div>

        {/* Problems */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Problems</label>
          </div>
          <div className="space-y-2 mb-3">
            {node.problems?.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/5">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    const newProblems = node.problems.map((prob, idx) => idx === i ? { ...prob, completed: !prob.completed } : prob);
                    updateNode(node._id, { problems: newProblems });
                  }}
                >
                  {p.completed ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Circle className="size-4 text-slate-500" />}
                  <span className={cn("text-sm", p.completed ? "text-slate-500 line-through" : "text-slate-300")}>{p.title}</span>
                </div>
                <button 
                  onClick={() => {
                    const newProblems = node.problems.filter((_, idx) => idx !== i);
                    updateNode(node._id, { problems: newProblems });
                  }}
                  className="text-slate-600 hover:text-red-400"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newProblem.trim()) return;
              const problems = [...(node.problems || []), { title: newProblem.trim(), completed: false }];
              updateNode(node._id, { problems });
              setNewProblem("");
            }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              value={newProblem} 
              onChange={(e) => setNewProblem(e.target.value)} 
              placeholder="Add problem..." 
              className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500/50"
            />
            <Button type="submit" size="sm" className="bg-white/10 hover:bg-white/20 h-auto px-3"><Plus className="size-3" /></Button>
          </form>
        </div>
      </div>

      {/* Children section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sub-topics ({children.length})</label>
          <Button variant="ghost" size="sm" onClick={() => setIsAddingChild(true)} className="h-7 text-xs text-violet-400 hover:bg-violet-500/10">
            <Plus className="size-3 mr-1" /> Add Child
          </Button>
        </div>

        {isAddingChild && (
          <form onSubmit={handleAddChild} className="flex gap-2 mb-3">
            <input 
              autoFocus 
              type="text" 
              value={newChildTitle} 
              onChange={(e) => setNewChildTitle(e.target.value)} 
              placeholder="Child topic name..." 
              className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500/50"
            />
            <Button type="submit" size="sm" className="bg-white/10 hover:bg-white/20 h-auto">Save</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingChild(false)} className="h-auto">Cancel</Button>
          </form>
        )}

        {children.length > 0 ? (
          <div className="space-y-1">
            {children.map(child => (
              <div key={child._id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-white/[0.02] border border-white/5 text-sm text-slate-300">
                {child.status === "complete" ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-4 text-slate-500" />}
                {child.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No sub-topics yet.</p>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { nodes, fetchRoadmap, addNode, exportRoadmap, isLoading } = useRoadmapStore();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const rootNodes = useMemo(() => nodes.filter(n => !n.parentId).sort((a,b) => a.order - b.order), [nodes]);
  const selectedNode = useMemo(() => nodes.find(n => n._id === selectedNodeId), [nodes, selectedNodeId]);

  const handleAddRoot = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNode({ title: newTitle, parentId: null });
    setNewTitle("");
    setIsAddingRoot(false);
  };

  const handleNodeDrop = (draggedId, targetId, position) => {
    const draggedNode = nodes.find(n => n._id === draggedId);
    const targetNode = nodes.find(n => n._id === targetId);
    if (!draggedNode || !targetNode) return;

    // Prevent dragging a parent into its own child (circular dependency check)
    let curr = targetNode;
    while(curr) {
      if (curr._id === draggedId) return; // invalid drop
      curr = nodes.find(n => n._id === curr.parentId);
    }

    let newParentId = null;
    let baseSiblings = [];

    if (position === "inside") {
      newParentId = targetNode._id;
      baseSiblings = nodes.filter(n => n.parentId === targetNode._id && n._id !== draggedId).sort((a,b) => a.order - b.order);
      baseSiblings.push(draggedNode); // add to end
    } else {
      newParentId = targetNode.parentId;
      baseSiblings = nodes.filter(n => n.parentId === targetNode.parentId && n._id !== draggedId).sort((a,b) => a.order - b.order);
      
      const targetIndex = baseSiblings.findIndex(n => n._id === targetId);
      if (position === "before") {
        baseSiblings.splice(targetIndex, 0, draggedNode);
      } else {
        baseSiblings.splice(targetIndex + 1, 0, draggedNode);
      }
    }

    // Recalculate order to preserve spacing
    const updates = baseSiblings.map((n, idx) => ({
      _id: n._id,
      parentId: newParentId,
      order: (idx + 1) * 1024
    }));

    useRoadmapStore.getState().reorderNodes(updates);
  };

  return (
    <PageContainer>
      <div className="page-heading flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Map />
          <div>
            <h1>Roadmap Explorer</h1>
            <p>Your learning journey, structured and organized.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              const json = exportRoadmap();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `journey_roadmap_${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            variant="ghost" 
            className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-white/5 transition-colors"
          >
            Export JSON
          </Button>
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            variant="ghost" 
            className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-white/5 transition-colors"
          >
            Import JSON
          </Button>
          <Button onClick={() => setIsAddingRoot(!isAddingRoot)} className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
            <Plus className="size-4 mr-2" /> New Goal
          </Button>
        </div>
      </div>

      <div className="mt-6 flex h-[calc(100vh-220px)] gap-6">
        {/* Left Pane: Explorer Tree */}
        <GlassCard className="w-[320px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Topics</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {isAddingRoot && (
              <form onSubmit={handleAddRoot} className="flex gap-2 mb-3 p-2">
                <input 
                  autoFocus 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Root topic name..." 
                  className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </form>
            )}

            {rootNodes.length === 0 && !isLoading && !isAddingRoot && (
              <div className="text-center py-10 px-4 text-sm text-slate-500">
                Your roadmap is empty. Click "New Goal" to start building.
              </div>
            )}

            {rootNodes.map(node => (
              <TreeNode 
                key={node._id} 
                node={node} 
                allNodes={nodes} 
                selectedNodeId={selectedNodeId}
                onSelect={setSelectedNodeId}
                onNodeDrop={handleNodeDrop}
              />
            ))}
          </div>
        </GlassCard>

        {/* Right Pane: Detail View */}
        <GlassCard className="flex-1 overflow-hidden relative">
          {selectedNode ? (
            <NodeDetails node={selectedNode} allNodes={nodes} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <Map className="size-16 mb-4 opacity-20" />
              <p>Select a topic from the explorer to view and edit details.</p>
            </div>
          )}
        </GlassCard>
      </div>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </PageContainer>
  );
}
