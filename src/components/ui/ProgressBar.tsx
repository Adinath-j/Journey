import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  accent?: "blue" | "mint" | "violet";
  className?: string;
  label?: string;
}

export function ProgressBar({ value, accent = "blue", className, label }: ProgressBarProps) {
  const widthClass = `progress-${Math.round(value / 5) * 5}`;
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/[0.055]", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
      <div className={cn("h-full rounded-full transition-[width] duration-200", widthClass, accent === "blue" && "progress-blue", accent === "mint" && "progress-mint", accent === "violet" && "progress-violet")} />
    </div>
  );
}
