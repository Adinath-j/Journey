import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSessionStore = create(
  persist(
    (set, get) => ({
      isActive: false,
      promptResume: false,
      topic: null,
      startTime: null,
      accumulatedSeconds: 0,
      isPlaying: false,
      lastResumedTime: null,
      notes: "",
      completedConcepts: [], // array of concept titles
      completedProblems: [], // array of problem titles

      startSession: (topic) => {
        set({
          isActive: true,
          topic,
          startTime: Date.now(),
          accumulatedSeconds: 0,
          isPlaying: true,
          lastResumedTime: Date.now(),
          notes: "",
          completedConcepts: [],
          completedProblems: [],
        });
      },

      resumeSession: () => {
        set({ isActive: true });
      },

      minimizeSession: () => {
        set({ isActive: false });
      },

      togglePlayPause: () => {
        const { isPlaying, lastResumedTime, accumulatedSeconds } = get();
        if (isPlaying) {
          // Pausing: add the elapsed time since last resumed to accumulated
          const elapsedSinceResume = Math.floor((Date.now() - lastResumedTime) / 1000);
          set({
            isPlaying: false,
            accumulatedSeconds: accumulatedSeconds + elapsedSinceResume,
            lastResumedTime: null,
          });
        } else {
          // Resuming
          set({
            isPlaying: true,
            lastResumedTime: Date.now(),
          });
        }
      },

      updateNotes: (notes) => set({ notes }),

      toggleConcept: (title) => {
        const { completedConcepts } = get();
        if (completedConcepts.includes(title)) {
          set({ completedConcepts: completedConcepts.filter(c => c !== title) });
        } else {
          set({ completedConcepts: [...completedConcepts, title] });
        }
      },

      toggleProblem: (title) => {
        const { completedProblems } = get();
        if (completedProblems.includes(title)) {
          set({ completedProblems: completedProblems.filter(p => p !== title) });
        } else {
          set({ completedProblems: [...completedProblems, title] });
        }
      },

      getElapsedSeconds: () => {
        const { isPlaying, lastResumedTime, accumulatedSeconds } = get();
        if (!isPlaying || !lastResumedTime) return accumulatedSeconds;
        return accumulatedSeconds + Math.floor((Date.now() - lastResumedTime) / 1000);
      },

      endSession: () => {
        set({
          isActive: false,
          promptResume: false,
          topic: null,
          startTime: null,
          accumulatedSeconds: 0,
          isPlaying: false,
          lastResumedTime: null,
          notes: "",
          completedConcepts: [],
          completedProblems: [],
        });
      },

      discardSession: () => {
        get().endSession();
      },
      
      acceptResume: () => {
        set({ isActive: true, promptResume: false, isPlaying: false, lastResumedTime: null }); // Resume in paused state
      }
    }),
    {
      name: "journey-session-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.isActive) {
          // If the app was closed while a session was active, prompt the user instead of auto-opening
          state.isActive = false;
          state.promptResume = true;
          // Auto-pause the timer based on when it was closed
          if (state.isPlaying && state.lastResumedTime) {
            const elapsedSinceResume = Math.floor((Date.now() - state.lastResumedTime) / 1000);
            state.accumulatedSeconds += elapsedSinceResume;
            state.isPlaying = false;
            state.lastResumedTime = null;
          }
        }
      }
    }
  )
);
