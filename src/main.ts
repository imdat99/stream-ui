import { PiniaColada, useQueryCache } from '@pinia/colada';
import { createHead as CSRHead } from "@unhead/vue/client";
import { createHead as SSRHead } from "@unhead/vue/server";
import { createPinia } from "pinia";
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';
import { withErrorBoundary } from './lib/hoc/withErrorBoundary';
import createAppRouter from './routes';

const bodyClass = ":uno: font-sans text-gray-800 antialiased flex flex-col min-h-screen"
export function createApp() {
    const pinia = createPinia();
    const app = createSSRApp(withErrorBoundary(RouterView));
    const head = import.meta.env.SSR ? SSRHead() : CSRHead();

    app.use(head);
    app.directive('nh', {
        created(el) {
            el.__v_skip = true;
        }
    });
    app.use(pinia);
    app.use(PiniaColada, {
        pinia,
        plugins: [
            (context) => {
                // console.log("PiniaColada plugin initialized for store:", context);
            }
        ],
        queryOptions: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            ssrCatchError: true,
        }
        // optional options
    })
    // app.use(vueSWR({ revalidateOnFocus: false }));
    const queryCache = useQueryCache();
    const router = createAppRouter();
    app.use(router);
    if (!import.meta.env.SSR) {
        Object.entries(JSON.parse(document.getElementById("__APP_DATA__")?.innerText || "{}")).forEach(([key, value]) => {
            (window as any)[key] = value;
        });
        if ((window as any).$p) {
            pinia.state.value = (window as any).$p;
        }
    }
    return { app, router, head, pinia, bodyClass, queryCache };
}
