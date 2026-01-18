/// <reference types="vite/client" />
/// <reference types="unplugin-vue-components/types/vue" />

declare module "@httpClientAdapter" {
    export const customFetch: (url: string, options: RequestInit) => Promise<Response>;
}