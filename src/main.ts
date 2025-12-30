import { createHead as CSRHead } from "@unhead/vue/client";
import { createHead as SSRHead } from "@unhead/vue/server";
import { createSSRApp } from 'vue';
import { RouterView } from 'vue-router';
import { withErrorBoundary } from './lib/hoc/withErrorBoundary';
import { vueSWR } from './lib/swr/use-swrv';
import router from './routes';
// import { appComponents } from './components'
export function createApp() {
    
    const app = createSSRApp(withErrorBoundary(RouterView))
    const head = import.meta.env.SSR ? SSRHead() : CSRHead()
    app.use(head)
    app.use(vueSWR({revalidateOnFocus: false}))
    app.use(router)
    return { app, router, head }
}