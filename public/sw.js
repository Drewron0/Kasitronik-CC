// Kasitronik service worker: shows collector notifications and opens their link.
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Kasitronik", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Kasitronik";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "",
    tag: data.tag || undefined,
    icon: "/logo.png",
    badge: "/logo.png",
    data: { url: data.url || "/p" },
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/p", self.location.origin);
  // Only open pages of this site, never a URL from elsewhere.
  if (target.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url === target.href && "focus" in client) return client.focus();
    }
    return self.clients.openWindow(target.href);
  })());
});
