/// <reference types="vite/client" />
/// <reference types="unplugin-vue-components/types/vue" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module "@httpClientAdapter" {
    export const customFetch: typeof fetch;
}