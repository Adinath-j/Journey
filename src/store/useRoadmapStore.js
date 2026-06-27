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
      
      // Optimistic update for the specific node to prevent UI flicker
      set((state) => ({
        nodes: state.nodes.map((node) => (node._id === id ? updatedNode : node)),
      }));

      // Because the backend might have auto-completed parent nodes based on this update,
      // and the dashboard progress needs to recalculate, we trigger a global sync.
      get().fetchRoadmap();
      
      // Dynamically import to avoid circular dependency
      import('./useDashboardStore').then(module => {
        module.useDashboardStore.getState().fetchDashboard();
      });

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

  reorderNodes: async (updates) => {
    // Optimistic update for seamless drag and drop
    set((state) => {
      const newNodes = [...state.nodes];
      updates.forEach(update => {
        const index = newNodes.findIndex(n => n._id === update._id);
        if (index !== -1) {
          newNodes[index] = { ...newNodes[index], parentId: update.parentId, order: update.order };
        }
      });
      // Sort optimistically
      newNodes.sort((a, b) => a.order - b.order);
      return { nodes: newNodes };
    });

    try {
      await api.put('/roadmap/reorder', { updates });
      // Fetch fresh to ensure server-side calculated fields (if any) are correct
      get().fetchRoadmap();
    } catch (error) {
      set({ error: error.message });
      get().fetchRoadmap(); // Rollback on failure
    }
  },

  importRoadmap: async (nodes) => {
    set({ isLoading: true });
    try {
      await api.post('/roadmap/import', { nodes });
      await get().fetchRoadmap();
      
      import('./useDashboardStore').then(module => {
        module.useDashboardStore.getState().fetchDashboard();
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  exportRoadmap: () => {
    const state = get();
    // Helper to build tree
    const buildTree = (parentId = null) => {
      const children = state.nodes.filter(n => n.parentId === parentId).sort((a, b) => a.order - b.order);
      return children.map(child => ({
        title: child.title,
        description: child.description,
        status: child.status,
        estimatedHours: child.estimatedHours,
        concepts: child.concepts.map(c => ({ title: c.title, completed: c.completed })),
        problems: child.problems.map(p => ({ title: p.title, completed: p.completed })),
        resources: child.resources,
        notes: child.notes,
        children: buildTree(child._id)
      }));
    };

    const tree = buildTree(null);
    return JSON.stringify(tree, null, 2);
  },
}));
