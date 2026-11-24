export function createFakeNotifier({ failPush = false, gonePush = false, failEmail = false } = {}) {
  const pushes = [];
  const emails = [];
  return {
    pushes,
    emails,
    async push(target, payload) {
      pushes.push({ target, payload });
      if (gonePush) return { ok: false, gone: true, error: "410 Gone" };
      if (failPush) return { ok: false, gone: false, error: "push down" };
      return { ok: true };
    },
    async email(message) {
      emails.push(message);
      return failEmail ? { ok: false, gone: false, error: "smtp down" } : { ok: true };
    },
  };
}
