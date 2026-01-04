import { createHead as CSRHead } from "@unhead/vue/client";
import { createHead as SSRHead } from "@unhead/vue/server";
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';
import { withErrorBoundary } from './lib/hoc/withErrorBoundary';
import { vueSWR } from './lib/swr/use-swrv';
import createAppRouter from './routes';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { createPinia } from "pinia";
import { useAuthStore } from './stores/auth';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
const bodyClass = ":uno: font-sans bg-[#f9fafd] text-gray-800 antialiased flex flex-col min-h-screen"
export function createApp() {
    const pinia = createPinia();
    const app = createSSRApp(withErrorBoundary(RouterView));
    const head = import.meta.env.SSR ? SSRHead() : CSRHead();
    
    app.use(head);
    app.use(PrimeVue, {
        // unstyled: true,
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.my-app-dark',
                // cssLayer: {
                //     name: 'primevue',
                //     order: 'theme, base, primevue'
                // }
            }
        }
    });
    app.use(ToastService);
    app.directive('no-hydrate', {
        created(el) {
            el.__v_skip = true;
        }
    });
    app.directive("tooltip", Tooltip)
    if (!import.meta.env.SSR) {
        if ((window as any).__PINIA_STATE__ ) {
            pinia.state.value = (window as any).__PINIA_STATE__;
        }
    }
    app.use(pinia);
    app.use(vueSWR({revalidateOnFocus: false}));
    const router = createAppRouter();
    app.use(router);
    
    return { app, router, head, pinia, bodyClass };
}