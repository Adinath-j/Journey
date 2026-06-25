import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  GitCommitHorizontal,
  Trophy,
} from "lucide-react";

export const dashboardOverview = {
  userName: "Adinath",
  greeting: "Good Evening",
  subtitle: "Small progress today, big results tomorrow.",
  overallProgress: 46,
  estimatedTime: "4h 0m",
};

export const metrics = [
  { id: "progress", label: "Overall Progress", value: "46%", suffix: "", accent: "violet", icon: BarChart3, progress: 46, message: "Keep going!" },
  { id: "streak", label: "Study Streak", value: "17", suffix: "days", accent: "orange", icon: Flame },
  { id: "hours", label: "Hours This Week", value: "28.5", suffix: "hours", accent: "blue", icon: Clock3 },
  { id: "projects", label: "Projects Completed", value: "4", suffix: "projects", accent: "mint", icon: CheckCircle2 },
];

export const focusItems = [
  { label: "Software Engineering", progress: 60, accent: "blue" },
  { label: "Generative AI", progress: 35, accent: "mint" },
];

export const missionItems = [
  { id: "trees", label: "Solve 3 Tree problems", duration: "1.5h", completed: true },
  { id: "jwt", label: "Complete JWT Authentication", duration: "2.0h", completed: true },
  { id: "rag", label: "Read 30 min about RAG", duration: "0.5h", completed: false },
];

export const quickStats = [
  { label: "DSA Problems Solved", value: "72 / 300", icon: Code2, accent: "text-sky-400" },
  { label: "LeetCode Contests", value: "2", icon: Trophy, accent: "text-amber-300" },
  { label: "GitHub Commits", value: "48", icon: GitCommitHorizontal, accent: "text-slate-300" },
  { label: "Total Study Hours", value: "126.5", icon: Clock3, accent: "text-rose-400" },
];

export const quote = { text: "Discipline today, freedom tomorrow.", author: "Your Future Self" };
export const dailyTip = "Focus on building systems, not just solving problems.";
