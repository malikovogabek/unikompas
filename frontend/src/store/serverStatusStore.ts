import { create } from 'zustand'

type ServerStatusState = {
  /** Requests that have been waiting longer than the "slow" threshold (e.g. server waking up). */
  slowRequests: number
  begin: () => void
  end: () => void
}

/** Global indicator for a slow backend (free-tier cold start), shown by WakeBanner. */
export const useServerStatusStore = create<ServerStatusState>((set) => ({
  slowRequests: 0,
  begin: () => set((s) => ({ slowRequests: s.slowRequests + 1 })),
  end: () => set((s) => ({ slowRequests: Math.max(0, s.slowRequests - 1) })),
}))
