import { useCallback, useState } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'unikompas.theme'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** Light/dark theme; the initial value is applied before paint by a script in index.html. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage may be unavailable (private mode); the theme still applies for this session.
    }
    setTheme(next)
  }, [])

  return { theme, toggle }
}
