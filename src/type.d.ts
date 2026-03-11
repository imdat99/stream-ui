/// <reference types="vite/client" />
/// <reference types="unplugin-vue-components/types/vue" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module "@httpClientAdapter" {
    import { TinyRpcClientAdapter } from "@hiogawa/tiny-rpc";
    export function httpClientAdapter(opts: {
        url: string;
        pathsForGET?: string[];
        headers?: () => Promise<{ Authorization?: undefined; } | { Authorization: string; }>
    }): TinyRpcClientAdapter;
}