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
        headers?: () => Promise<Record<string, string>>;
    }): TinyRpcClientAdapter;
}

interface JsonTransformer {
  parse: (v: string, getHeader?: () => Record<string, string>) => any; // TODO: eliminate proto pollution at least on server by default cf. https://github.com/fastify/secure-json-parse
  stringify: (v: any, setHeader?: (headers: Record<string, string>) => void) => string;
}