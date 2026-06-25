import { create } from "zustand";
import { api } from "@/services/api";

export const useDashboardStore = create((set) => ({
  overview: null,
  metrics: [],
  quickStats: [],
  focusItems: [],
  missionItems: [],
  heatmap: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get("/dashboard");
      set({
        overview: data.overview,
        metrics: data.metrics,
        quickStats: data.quickStats,
        focusItems: data.focusItems || [],
        missionItems: data.missionItems || [],
        heatmap: data.heatmap,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
