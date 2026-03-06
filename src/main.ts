import { PiniaColada, useQueryCache } from '@pinia/colada';
import { createHead as CSRHead } from '@unhead/vue/client';
import { createHead as SSRHead } from '@unhead/vue/server';
import { createPinia } from 'pinia';
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';

import type { i18n as I18nInstance } from 'i18next';
import I18NextVue from 'i18next-vue';

import { createI18nInstance, initI18nInstance } from '@/lib/translation';
import { createI18nForClient } from '@/lib/translation/client';

import { withErrorBoundary } from './lib/hoc/withErrorBoundary';
import createAppRouter from './routes';

const bodyClass = ':uno: font-sans text-gray-800 antialiased flex flex-col min-h-screen';

const getSerializedAppData = () => {
    if (typeof document === 'undefined') return {} as Record<string, any>;
    return JSON.parse(document.getElementById('__APP_DATA__')?.innerText || '{}') as Record<string, any>;
};

export async function createApp(lng: string = 'en', i18next?: I18nInstance) {
    const pinia = createPinia();
    const app = createSSRApp(withErrorBoundary(RouterView));
    
    const head = import.meta.env.SSR ? SSRHead() : CSRHead();
    const appData = !import.meta.env.SSR ? getSerializedAppData() : ({} as Record<string, any>);

    app.use(head);
    app.directive('nh', {
        created(el) {
            el.__v_skip = true;
        }
    });
    app.use(pinia);
    const runtimeI18n = import.meta.env.SSR
        ? (i18next ?? createI18nInstance(true))
        : await createI18nForClient(lng);
    if (import.meta.env.SSR) {
        await initI18nInstance(runtimeI18n, lng, true);
    }
    app.use(I18NextVue, { i18next: runtimeI18n });
    app.use(PiniaColada, {
        pinia,
        plugins: [
            () => {
                // reserved for query plugins
            }
        ],
        queryOptions: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            ssrCatchError: true,
        }
    });

    const queryCache = useQueryCache();
    const router = createAppRouter();
    app.use(router);

    if (!import.meta.env.SSR) {
        Object.entries(appData).forEach(([key, value]) => {
            (window as any)[key] = value;
        });
        if ((window as any).$p) {
            pinia.state.value = (window as any).$p;
        }
    }

    return { app, router, head, pinia, bodyClass, queryCache };
}
