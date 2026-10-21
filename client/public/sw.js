/* Privacy-minimal companion push: content remains behind authenticated in-app retrieval. */
self.addEventListener("push", (event) => {
  let intentId = null;
  try {
    const payload = event.data ? event.data.json() : {};
    if (typeof payload.intentId === "string" && /^[A-Za-z0-9-]{1,64}$/.test(payload.intentId)) {
      intentId = payload.intentId;
    }
  } catch {
    // Malformed or empty push still gets only the generic notification.
  }
  event.waitUntil(self.registration.showNotification("Ascend Vision", {
    body: "You have a private update.",
    tag: intentId ? `ascend-${intentId}` : "ascend-private-update",
    data: { intentId },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const intentId = event.notification.data?.intentId;
  const target = new URL("/phone-chat", self.location.origin);
  if (typeof intentId === "string" && /^[A-Za-z0-9-]{1,64}$/.test(intentId)) {
    target.searchParams.set("notificationId", intentId);
  }
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      existing.navigate(target.href);
      return existing.focus();
    }
    return self.clients.openWindow(target.href);
  }));
});
