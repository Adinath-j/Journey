export type PageId = "dashboard" | "heatmap" | "roadmap" | "log";

export interface NavigationItem {
  id: PageId;
  label: string;
}
