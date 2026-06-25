import { create } from "zustand";
import { api } from "@/services/api";

export const useRoadmapStore = create((set, get) => ({
  nodes: [],
  isLoading: false,
  error: null,

  fetchRoadmap: async () => {
    set({ isLoading: true, error: null });
    try {
      const nodes = await api.get("/roadmap");
      set({ nodes, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addNode: async (data) => {
    try {
      const newNode = await api.post("/roadmap", data);
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateNode: async (id, data) => {
    try {
      const updatedNode = await api.put(`/roadmap/${id}`, data);
      set((state) => ({
        nodes: state.nodes.map((node) => (node._id === id ? updatedNode : node)),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteNode: async (id) => {
    try {
      const res = await api.delete(`/roadmap/${id}`);
      set((state) => ({
        nodes: state.nodes.filter((node) => !res.deletedIds.includes(node._id)),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
