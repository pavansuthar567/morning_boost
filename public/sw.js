// Force new SW to activate immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', function (event) {
    if (!event.data) return;
    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { body: event.data.text() };
    }

    const {
        symbol = 'Alert',
        action = '',
        side = '',
        timeframe,
        entryPrice,
        sl,
        indicatorName,
        strike,
        ts,
        url,
    } = payload;

    const title = `${symbol} • ${action || 'ALERT'} • ${side || ''}`.trim();
    const bodyParts = [
        timeframe ? `TF: ${timeframe}m` : null,
        entryPrice !== undefined ? `Entry: ${entryPrice}` : null,
        sl !== undefined ? `SL: ${sl}` : null,
        strike !== undefined ? `Strike: ${strike}` : null,
        indicatorName || null,
        ts ? new Date(ts).toLocaleString() : null,
    ].filter(Boolean);

    const body = bodyParts.join(' | ') || 'You have a new alert';

    const data = { url: url || '/alerts-feed', ...payload };

    event.waitUntil(
        // self.registration.showNotification(title, {
        //     body,
        //     icon: '/icons/icon-192x192.png',
        //     badge: '/icons/icon-192x192.png',
        //     data,
        //     tag: data?.tag || 'niftyswift-alert',
        //     renotify: true,
        //   })
        Promise.all([
            self.registration.showNotification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                data,
                tag: data?.tag || 'niftyswift-alert',
                renotify: true,
            }),
            // Broadcast to open pages to update feed
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) => {
                cls.forEach((client) => client.postMessage({ type: 'PUSH_ALERT', payload }));
            }),
        ])
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data?.url || '/alerts-feed';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});


