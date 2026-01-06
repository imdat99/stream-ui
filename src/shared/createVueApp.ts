import Aura from '@primeuix/themes/aura';
import { createHead as CSRHead } from "@unhead/vue/client";
import { createHead as SSRHead } from "@unhead/vue/server";
import { createPinia } from "pinia";
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';
import { withErrorBoundary } from '@/lib/hoc/withErrorBoundary';
import { vueSWR } from '@/lib/swr/use-swrv';
import createAppRouter from '@/routes';
const bodyClass = ":uno: font-sans text-gray-800 antialiased flex flex-col min-h-screen bg-gray-50";
function createApp() {
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
                cssLayer: false,
                // cssLayer: {
                //     name: 'primevue',
                //     order: 'theme, base, primevue'
                // }
            }
        }
    });
    app.use(ToastService);
    app.directive('nh', {
        created(el) {
            el.__v_skip = true;
        }
    });
    app.directive("tooltip", Tooltip)
    if (!import.meta.env.SSR) {
        Object.entries(JSON.parse(document.getElementById("__APP_DATA__")?.innerText || "{}")).forEach(([key, value]) => {
            (window as any)[key] = value;
        });
        if ((window as any).$p ) {
            pinia.state.value = (window as any).$p;
        }
    }
    app.use(pinia);
    app.use(vueSWR({revalidateOnFocus: false}));
    const router = createAppRouter();
    app.use(router);
    
    return { app, router, head, pinia, bodyClass };
}
export default createApp;