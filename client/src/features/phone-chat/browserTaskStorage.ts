const SESSION_KEY = "ascend.browser-tasks.session.v1";
const PROVIDER_KEY = "ascend.browser-tasks.provider.v1";
const TASK_KEY = "ascend.browser-tasks.active-task.v1";
const SESSION_END_KEY = "ascend.browser-tasks.session-end.v1";
const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

export function pendingBrowserSessionEnds(storage: Storage | null): string[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(SESSION_END_KEY) ?? "[]"
    );
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (value): value is string =>
                typeof value === "string" && UUID_PATTERN.test(value)
            )
          ),
        ].slice(0, 8)
      : [];
  } catch {
    return [];
  }
}

function savePending(storage: Storage, sessionIds: string[]): void {
  const bounded = [
    ...new Set(sessionIds.filter((id) => UUID_PATTERN.test(id))),
  ].slice(-8);
  if (bounded.length) storage.setItem(SESSION_END_KEY, JSON.stringify(bounded));
  else storage.removeItem(SESSION_END_KEY);
}

export function clearBrowserTaskContent(
  storage: Storage | null,
  browserSessionId: string | null
): void {
  if (!storage) return;
  try {
    if (browserSessionId && UUID_PATTERN.test(browserSessionId)) {
      savePending(storage, [
        ...pendingBrowserSessionEnds(storage),
        browserSessionId,
      ]);
    }
    storage.removeItem(SESSION_KEY);
    storage.removeItem(PROVIDER_KEY);
    storage.removeItem(TASK_KEY);
  } catch {
    /* Local state is still cleared by the caller. */
  }
}

export function queueBrowserSessionEnd(storage: Storage | null, browserSessionId: string): void {
  if (!storage || !UUID_PATTERN.test(browserSessionId)) return;
  try { savePending(storage, [...pendingBrowserSessionEnds(storage), browserSessionId]); }
  catch { /* Session expiry remains the server fallback. */ }
}

export function removePendingBrowserSessionEnd(
  storage: Storage | null,
  browserSessionId: string
): void {
  if (!storage) return;
  try {
    savePending(
      storage,
      pendingBrowserSessionEnds(storage).filter((id) => id !== browserSessionId)
    );
  } catch {
    /* Retrying later is safe and idempotent. */
  }
}
