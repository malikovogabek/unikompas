import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filters live in the URL (CLAUDE.md §7.6): shareable links and working back button.
 * Changing any filter other than `page` resets the page to 0.
 */
export function useSearchParamState() {
  const [params, setParams] = useSearchParams()

  const get = useCallback((key: string) => params.get(key) ?? '', [params])
  const getNumber = useCallback((key: string) => {
    const v = Number(params.get(key))
    return params.has(key) && Number.isFinite(v) ? v : undefined
  }, [params])

  const set = useCallback(
    (key: string, value: string | number | undefined) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === undefined || value === '') {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
          if (key !== 'page') {
            next.delete('page')
          }
          return next
        },
        { replace: key !== 'page' },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  return { get, getNumber, set, reset, hasAny: [...params.keys()].some((k) => k !== 'page') }
}
