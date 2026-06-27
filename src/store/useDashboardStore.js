import { create } from "zustand";
import { api } from "@/services/api";

export const useDashboardStore = create((set) => ({
  userName: "",
  hero: null,
  weeklyProgress: null,
  todaysPlan: [],
  currentTopic: null,
  remainingTopics: [],
  recentActivity: [],
  timeline: [],
  heatmap: [],
  isLoading: true,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get("/dashboard");
      set({
        userName: data.userName,
        hero: data.hero,
        weeklyProgress: data.weeklyProgress,
        todaysPlan: data.todaysPlan || [],
        currentTopic: data.currentTopic,
        remainingTopics: data.remainingTopics || [],
        recentActivity: data.recentActivity || [],
        timeline: data.timeline || [],
        heatmap: data.heatmap || [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
