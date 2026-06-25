import { Check, Map } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { roadmapMilestones } from "@/data/mock/roadmap";

export default function Roadmap() {
  return <PageContainer><div className="page-heading"><Map /><div><h1>Your roadmap</h1><p>Turn ambitious goals into visible, manageable steps.</p></div></div><div className="relative mt-8 space-y-4 before:absolute before:bottom-10 before:left-[27px] before:top-10 before:w-px before:bg-violet-400/20">{roadmapMilestones.map((item, index) => <GlassCard key={item.title} className="relative flex items-center gap-5 p-5"><span className={`z-10 grid size-14 shrink-0 place-items-center rounded-2xl ${item.status === "complete" ? "bg-emerald-400/15 text-emerald-300" : item.status === "active" ? "bg-violet-400/20 text-violet-300" : "bg-white/5 text-slate-400"}`}>{item.status === "complete" ? <Check /> : index + 1}</span><div><h2 className="font-medium">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.detail}</p></div></GlassCard>)}</div></PageContainer>;
}
