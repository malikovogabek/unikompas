import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'

export const COMPARE_MAX = 4

type CompareState = {
  ids: number[]
  toggle: (id: number) => void
  remove: (id: number) => void
  clear: () => void
}

/** Programmes picked for side-by-side comparison (FR-7.2), kept per browser tab session. */
export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id) ? { ids: s.ids.filter((x) => x !== id) } : s.ids.length >= COMPARE_MAX ? s : { ids: [...s.ids, id] },
        ),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'unikompas.compare', storage: createJSONStorage(() => sessionStorage) },
  ),
)

// A different user (or logout) starts with an empty comparison.
useAuthStore.subscribe((state, prev) => {
  if (state.token !== prev.token) {
    useCompareStore.getState().clear()
  }
})
