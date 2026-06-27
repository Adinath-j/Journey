import { Handle, Position } from '@xyflow/react';
import { Lock, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function CustomNode({ data, isConnectable }) {
  return (
    <div className={cn(
      "w-[250px] rounded-xl border p-4 shadow-xl bg-[#0f1524] transition-all",
      data.status === "completed" ? "border-emerald-500/50 shadow-emerald-500/10" :
      data.status === "active" ? "border-violet-500 shadow-violet-500/20 ring-1 ring-violet-500/50" :
      "border-white/10 opacity-60 grayscale"
    )}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-slate-700 border-none" />
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "size-8 rounded-lg flex items-center justify-center shrink-0",
          data.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
          data.status === "active" ? "bg-violet-500/20 text-violet-400" :
          "bg-white/5 text-slate-500"
        )}>
          {data.status === "completed" ? <CheckCircle2 className="size-4" /> :
           data.status === "active" ? <Play className="size-4" /> :
           <Lock className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-200 truncate" title={data.title}>{data.title}</h3>
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mt-0.5">{data.status}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-slate-700 border-none" />
    </div>
  );
}
