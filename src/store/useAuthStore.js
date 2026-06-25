import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post("/auth/login", { email, password });
          localStorage.setItem("journey_auth_token", data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post("/auth/register", { email, password, name });
          localStorage.setItem("journey_auth_token", data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.get("/auth/logout");
        } catch (error) {
          // Ignore errors on logout
        } finally {
          localStorage.removeItem("journey_auth_token");
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("journey_auth_token");
        if (!token) return;

        try {
          const data = await api.get("/auth/me");
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem("journey_auth_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "journey-auth-storage",
      partialize: (state) => ({ token: state.token }), // only persist token
    }
  )
);
