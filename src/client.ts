import { hydrateQueryCache } from '@pinia/colada';
import 'uno.css';
import { createApp } from './main';
async function render() {
    const { app, router, queryCache } = createApp();
    hydrateQueryCache(queryCache, (window as any).$colada || {});
    router.isReady().then(() => {
        app.mount('body', true)
    })
}
render().catch((error) => {
    console.error('Error during app initialization:', error)
})
