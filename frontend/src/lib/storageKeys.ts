/** Per-user draft of the career test (answers kept between visits). */
export const TEST_DRAFT_PREFIX = 'unikompas.testDraft.'

export function testDraftKey(userId: number): string {
  return `${TEST_DRAFT_PREFIX}${userId}`
}

/** Removes every per-user draft — called whenever the session changes. */
export function clearUserDrafts(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(TEST_DRAFT_PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
