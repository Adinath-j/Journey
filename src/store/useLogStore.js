import { create } from "zustand";
import { api } from "@/services/api";
import { useDashboardStore } from "./useDashboardStore";
import { useRoadmapStore } from "./useRoadmapStore";

export const useLogStore = create((set) => ({
  logs: [],
  isLoading: false,
  error: null,

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await api.get("/logs");
      set({ logs, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addLog: async (data) => {
    set({ isLoading: true });
    try {
      const newLog = await api.post("/logs", data);
      set((state) => ({ logs: [newLog, ...state.logs], isLoading: false }));
      
      // Automatic Synchronization: A new log affects the dashboard stats and potentially roadmap status
      useDashboardStore.getState().fetchDashboard();
      useRoadmapStore.getState().fetchRoadmap();
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
