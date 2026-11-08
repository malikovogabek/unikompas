import { create } from 'zustand'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'unikompas.theme'

type ThemeState = { theme: Theme; toggle: () => void }

/**
 * Shared theme state, so every toggle instance (desktop + mobile header) stays in sync.
 * The initial theme is applied before first paint by a script in index.html.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage may be unavailable (private mode); the theme still applies for this session.
    }
    set({ theme: next })
  },
}))
