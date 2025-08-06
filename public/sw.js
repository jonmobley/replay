const CACHE_NAME = 'replay-v1.1'
const STATIC_CACHE_NAME = 'replay-static-v1.1'
const AUDIO_CACHE_NAME = 'replay-audio-v1.1'

const urlsToCache = [
  '/',
  '/manifest.json',
  '/styles/globals.css'
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Replay Service Worker: Installing...')
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Replay Service Worker: Caching static files')
        return cache.addAll(urlsToCache)
      }),
      caches.open(AUDIO_CACHE_NAME).then(() => {
        console.log('Replay Service Worker: Audio cache ready')
      })
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Replay Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== AUDIO_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Replay Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first for dynamic content, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle audio files separately
  if (request.url.includes('dropbox') && request.url.includes('content_link')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          console.log('Replay Service Worker: Serving audio from cache')
          return cachedResponse
        }
        
        try {
          const response = await fetch(request)
          if (response.ok) {
            // Only cache successful responses
            cache.put(request, response.clone())
          }
          return response
        } catch (error) {
          console.log('Replay Service Worker: Audio fetch failed, offline mode')
          // Return a cached response if available
          return cachedResponse
        }
      })
    )
    return
  }

  // Handle API requests (network first)
  if (url.pathname.includes('/functions/v1/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API responses, just return them
          return response
        })
        .catch(() => {
          // If offline, you might want to return some cached data or offline message
          return new Response('{"error":"Offline - please check your connection"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        })
    )
    return
  }

  // Handle all other requests (cache first for static, network first for dynamic)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return cached version
        if (response) {
          console.log('Replay Service Worker: Serving from cache:', request.url)
          return response
        }

        // No cache hit - fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache static resources
            if (request.method === 'GET' && 
                (request.url.includes('.css') || 
                 request.url.includes('.js') || 
                 request.url.includes('.json'))) {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache)
              })
            }

            return response
          })
          .catch(() => {
            // If network fails, try to serve a basic offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Replay Service Worker: Background sync triggered')
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending offline actions here
      Promise.resolve()
    )
  }
})

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'replay-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification('Replay', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})

console.log('Replay Service Worker: Loaded successfully')