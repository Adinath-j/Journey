import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  size?: "sm" | "lg";
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({ value, size = "sm", showValue = false, className }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className={cn("progress-ring relative grid shrink-0 place-items-center", size === "sm" ? "size-[78px]" : "size-[168px]", className)}>
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20c7ff" />
            <stop offset="48%" stopColor="#2677ff" />
            <stop offset="100%" stopColor="#8d43ff" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(99,102,241,.13)" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={`url(#ring-${size})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      {showValue && <span className={cn("relative font-semibold tracking-tight text-white", size === "lg" ? "text-4xl" : "text-xl")}>{value}%</span>}
    </div>
  );
}
