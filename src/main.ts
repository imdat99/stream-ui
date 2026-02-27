import { PiniaColada, useQueryCache } from '@pinia/colada';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { createHead as CSRHead } from "@unhead/vue/client";
import { createHead as SSRHead } from "@unhead/vue/server";
import { createPinia } from "pinia";
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';
import { withErrorBoundary } from './lib/hoc/withErrorBoundary';
import createAppRouter from './routes';

const CompactAura = definePreset(Aura, {
    semantic: {
        formField: {
            paddingX: '0.625rem',
            paddingY: '0.375rem',
            sm: {
                fontSize: '0.75rem',
                paddingX: '0.5rem',
                paddingY: '0.25rem',
            },
            lg: {
                fontSize: '1rem',
                paddingX: '0.75rem',
                paddingY: '0.5rem',
            },
        },
    },
});
const bodyClass = ":uno: font-sans text-gray-800 antialiased flex flex-col min-h-screen"
export function createApp() {
    const pinia = createPinia();
    const app = createSSRApp(withErrorBoundary(RouterView));
    const head = import.meta.env.SSR ? SSRHead() : CSRHead();

    app.use(head);
    app.use(PrimeVue, {
        // unstyled: true,
        theme: {
            preset: CompactAura,
            options: {
                darkModeSelector: '.my-app-dark',
                cssLayer: false,
            }
        }
    });
    app.use(ToastService);
    app.use(ConfirmationService);
    app.directive('nh', {
        created(el) {
            el.__v_skip = true;
        }
    });
    app.directive("tooltip", Tooltip)
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