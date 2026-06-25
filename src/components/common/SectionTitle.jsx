import { cn } from "@/lib/cn";

export function SectionTitle({ icon: Icon, children, className }) {
  return (
    <h2 className={cn("flex items-center gap-2.5 text-[15px] font-semibold text-slate-100", className)}>
      <Icon className="size-[19px] text-violet-400" strokeWidth={2.2} />
      {children}
    </h2>
  );
}
