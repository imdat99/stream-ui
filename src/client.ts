import { hydrateQueryCache } from '@pinia/colada';
import 'uno.css';
import PiniaSharedState from './lib/PiniaSharedState';
import { createApp } from './main';

async function render() {
    const { app, router, queryCache, pinia } = createApp();
    pinia.use(PiniaSharedState({enable: true, initialize: true}));
    hydrateQueryCache(queryCache, (window as any).$colada || {});
    router.isReady().then(() => {
        app.mount('body', true)
    })
}
render().catch((error) => {
    console.error('Error during app initialization:', error)
})
