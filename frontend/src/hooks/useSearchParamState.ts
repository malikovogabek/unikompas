import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDebouncedValue } from './useDebouncedValue'

/**
 * Filters live in the URL (CLAUDE.md §7.16): shareable links and a working back button.
 * Changing any filter other than `page` resets the page to 0.
 * `set` and `reset` are stable across renders (react-router's setter is not).
 */
export function useSearchParamState() {
  const [params, setParams] = useSearchParams()
  const setParamsRef = useRef(setParams)
  useLayoutEffect(() => {
    setParamsRef.current = setParams
  }, [setParams])

  const get = useCallback((key: string) => params.get(key) ?? '', [params])
  const getNumber = useCallback(
    (key: string) => {
      const v = Number(params.get(key))
      return params.has(key) && Number.isFinite(v) ? v : undefined
    },
    [params],
  )

  const set = useCallback((key: string, value: string | number | undefined) => {
    setParamsRef.current(
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
  }, [])

  const reset = useCallback(() => setParamsRef.current(new URLSearchParams(), { replace: true }), [])

  return { get, getNumber, set, reset, hasAny: [...params.keys()].some((k) => k !== 'page') }
}

/**
 * Text search bound to the `q` URL parameter: typing updates the URL after a debounce,
 * and external URL changes (back/forward, reset) update the input. Neither direction
 * writes when nothing changed, so pagination and history are left alone.
 */
export function useUrlSearch(params: ReturnType<typeof useSearchParamState>) {
  const urlValue = params.get('q')
  const [value, setValue] = useState(urlValue)
  const debounced = useDebouncedValue(value)
  const synced = useRef(urlValue)
  const { set } = params

  // URL → input (back/forward, reset)
  useEffect(() => {
    if (urlValue !== synced.current) {
      synced.current = urlValue
      setValue(urlValue)
    }
  }, [urlValue])

  // input → URL (only real edits)
  useEffect(() => {
    const next = debounced.trim()
    if (next !== synced.current) {
      synced.current = next
      set('q', next)
    }
  }, [debounced, set])

  return [value, setValue] as const
}
