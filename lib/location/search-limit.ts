// shortcut: counters are per process; use a shared store before deploying multiple instances.
const users = new Map<string, { count: number; expires: number }>();
let providerWindow = { count: 0, expires: 0 };

export function takeSearchSlot(userId: string, now = Date.now()) {
  for (const [id, window] of users) if (window.expires <= now) users.delete(id);
  const user = users.get(userId) ?? { count: 0, expires: now + 60_000 };
  if (providerWindow.expires <= now) providerWindow = { count: 0, expires: now + 1000 };
  if (user.count >= 30 || providerWindow.count >= 4 || !users.has(userId) && users.size >= 10_000) return false;
  user.count++; providerWindow.count++; users.set(userId, user);
  return true;
}
