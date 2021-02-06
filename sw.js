const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v3';

const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/materialize.min.css',
    '/css/styles.css',
    '/img/dish.png',
    '/img/icons/icon-96x96.png',
    'https://fonts.gstatic.com/s/materialicons/v70/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/pages/fallback.html'
];

// cache size limit 
const limitCacheSize = async(name, size) => {
    let cache = await caches.open(name);
    let keys = await cache.keys();
    if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
    }
}

// install service worker
self.addEventListener('install', (e) => {
    // console.log("service worker install 222");
    const preCache = async() => {
        try {
            let cache = await caches.open(staticCacheName);
            console.log('caching shell assets');
            return cache.addAll(assets);
        } catch (error) {
            console.log("This is An Error");
        }
    };
    e.waitUntil(preCache());
});

//activate service worker
self.addEventListener('activate', async(e) => {
    // console.log('service worker has been activated');
    const activeKey = async() => {
        let keys = await caches.keys();
        console.log(keys);
        return Promise.all(keys
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)
            .map(key => caches.delete(key))
        )

    };
    e.waitUntil(activeKey());
});

//fetch event 
self.addEventListener('fetch', (e) => {
    // console.log("fetch event", e);
    // let cache = await caches.match(e.request);
    // let response = cache || fetch(e.request);
    // e.respondWith(await response);
    if (!(e.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
    if (e.request.url.indexOf('firestore.googleapis.com') === -1){
            e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(e.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 4);
                    return fetchRes;
                });
            });
        }).catch(() => {
            if (e.request.url.indexOf('.html') > -1) {
                return caches.match('/pages/fallback.html');
            }
        })
    );

    } ;

});