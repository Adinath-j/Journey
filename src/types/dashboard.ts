import type { LucideIcon } from "lucide-react";

export type Accent = "violet" | "orange" | "blue" | "mint" | "cyan" | "rose";

export interface Metric {
  id: string;
  label: string;
  value: string;
  suffix: string;
  accent: Accent;
  icon: LucideIcon;
  progress?: number;
  message?: string;
}

export interface FocusItem {
  label: string;
  progress: number;
  accent: "blue" | "mint";
}

export interface MissionItem {
  id: string;
  label: string;
  duration: string;
  completed: boolean;
}

export interface QuickStat {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}
