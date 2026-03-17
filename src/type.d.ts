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
        JSON?: Partial<JsonTransformer>;
        headers?: () => Promise<{ Authorization?: undefined; } | { Authorization: string; }>
    }): TinyRpcClientAdapter;
}

interface JsonTransformer {
  parse: (v: string) => any; // TODO: eliminate proto pollution at least on server by default cf. https://github.com/fastify/secure-json-parse
  stringify: (v: any) => string;
}