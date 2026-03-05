import { hydrateQueryCache } from '@pinia/colada';
import 'uno.css';
import PiniaSharedState from './lib/PiniaSharedState';
import { createApp } from './main';

const readAppData = () => {
    return JSON.parse(document.getElementById('__APP_DATA__')?.innerText || '{}') as Record<string, any>;
};

async function render() {
    const appData = readAppData();
    const { app, router, queryCache, pinia } = await createApp(appData.$locale);
    pinia.use(PiniaSharedState({ enable: true, initialize: true }));
    hydrateQueryCache(queryCache, appData.$colada || {});

    Object.entries(appData).forEach(([key, value]) => {
        (window as any)[key] = value;
    });

    await router.isReady();
    app.mount('body', true);
}

render().catch((error) => {
    console.error('Error during app initialization:', error);
});
