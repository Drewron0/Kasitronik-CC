// shortcut: limits are per process and reset on restart; use a shared store before multi-instance deployment.
const windows = new Map<string, { count: number; expires: number }>();
const WINDOW_MS = 10 * 60 * 1000;

export function takeAssessmentSlot(userId: string, now = Date.now()): boolean {
  for (const [id, window] of windows) {
    if (window.expires <= now) windows.delete(id);
  }
  const current = windows.get(userId);
  if (current) {
    if (current.count >= 5) return false;
    current.count += 1;
    return true;
  }
  if (windows.size >= 10_000) return false;
  windows.set(userId, { count: 1, expires: now + WINDOW_MS });
  return true;
}
