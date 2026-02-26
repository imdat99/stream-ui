# Holistream - AI Agent Guide

This document provides comprehensive guidance for AI coding agents working on the Holistream project.

## Project Overview

**Holistream** is a Vue 3 streaming application with Server-Side Rendering (SSR) deployed on Cloudflare Workers. It provides video upload, management, and streaming capabilities with a focus on performance and user experience.

- **Name**: holistream
- **Type**: ES Module JavaScript/TypeScript project
- **Package Manager**: Bun (uses `bun.lock`)

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue 3.5+ with Composition API |
| **Rendering** | SSR (Server-Side Rendering) with Vue's `createSSRApp` |
| **Router** | Vue Router 5 with SSR-aware history |
| **Server** | Hono framework on Cloudflare Workers |
| **Build Tool** | Vite 7 with custom SSR plugin |
| **Styling** | UnoCSS (Tailwind-like utility-first CSS) |
| **UI Components** | PrimeVue 4 with Aura theme |
| **State Management** | Pinia 3 + Pinia Colada for server state |
| **HTTP Client** | Auto-generated from OpenAPI/Swagger spec |
| **Head Management** | @unhead/vue for SEO |
| **Icons** | Custom Vue icon components |
| **Validation** | Zod v4 |
| **Utils** | VueUse, clsx, tailwind-merge |

## Project Structure

```
├── src/
│   ├── api/                    # API client and HTTP adapters
│   │   ├── client.ts           # Auto-generated API client from Swagger
│   │   ├── httpClientAdapter.client.ts   # Browser fetch adapter
│   │   ├── httpClientAdapter.server.ts   # SSR fetch adapter with cookie forwarding
│   │   └── rpc/                # RPC utilities
│   ├── client.ts               # Client entry point (hydration)
│   ├── components/             # Vue components (auto-imported)
│   │   ├── icons/              # Custom SVG icon components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── ui/                 # UI primitive components
│   ├── composables/            # Vue composables
│   │   └── useUploadQueue.ts   # File upload queue management
│   ├── index.tsx               # Server entry point (Hono app)
│   ├── lib/                    # Utility libraries
│   │   ├── utils.ts            # Helper functions (cn, formatBytes, etc.)
│   │   ├── liteMqtt.ts         # MQTT client for real-time notifications
│   │   ├── swr/                # SWR cache implementation
│   │   └── directives/         # Vue custom directives
│   ├── main.ts                 # App factory function
│   ├── routes/                 # Route components
│   │   ├── auth/               # Login, signup, forgot password
│   │   ├── home/               # Landing, terms, privacy
│   │   ├── notification/       # Notification center
│   │   ├── overview/           # Dashboard overview
│   │   ├── plans/              # Payments & plans
│   │   ├── profile/            # User profile
│   │   ├── upload/             # Video upload interface
│   │   ├── video/              # Video list and detail
│   │   └── index.ts            # Router configuration
│   ├── server/                 # Server-specific modules
│   ├── stores/                 # Pinia stores
│   │   └── auth.ts             # Authentication state
│   ├── type.d.ts               # TypeScript declarations
│   └── worker/                 # Worker utilities
├── public/                     # Static assets (favicons, etc.)
├── docs.json                   # OpenAPI/Swagger specification
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite + Cloudflare plugin config
├── wrangler.jsonc              # Cloudflare Workers configuration
├── uno.config.ts               # UnoCSS configuration
├── ssrPlugin.ts                # Custom SSR build plugin
├── bootstrap_btn.ts            # Custom UnoCSS preset for Bootstrap buttons
├── auto-imports.d.ts           # Generated auto-import declarations
└── components.d.ts             # Generated component declarations
```

## Build and Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload
bun dev

# Production build (client + worker)
bun run build

# Preview production build locally
bun preview

# Deploy to Cloudflare Workers
bun run deploy

# Generate TypeScript types from Wrangler config
bun run cf-typegen

# View Cloudflare Worker logs
bun run tail
```

## Architecture Details

### SSR Architecture

The application uses a custom SSR setup (`ssrPlugin.ts`):

1. **Build Order**: Client bundle is built FIRST, then Worker bundle
2. **Manifest Injection**: Vite manifest is injected into server build for asset rendering
3. **Environment-based Module Resolution**: Different implementations for `@httpClientAdapter` and `@liteMqtt` based on SSR context

**Entry Points**:
- **Server**: `src/index.tsx` - Hono app that renders Vue SSR stream
- **Client**: `src/client.ts` - Hydrates the SSR-rendered app
- **Factory**: `src/main.ts` - Creates app instance (used by both)

### Module Aliases

| Alias | Resolution |
|-------|------------|
| `@/` | `./src/` |
| `@httpClientAdapter` | `src/api/httpClientAdapter.server.ts` (SSR) or `.client.ts` (browser) |
| `@liteMqtt` | `src/lib/liteMqtt.server.ts` (SSR) or `.ts` (browser) |

### State Management Pattern

Uses **Pinia Colada** for server state with SSR hydration:

- Queries are fetched server-side and serialized to `window.__APP_DATA__`
- Client hydrates the query cache on startup via `hydrateQueryCache()`
- Pinia state is similarly serialized and restored via `PiniaSharedState` plugin

### API Client Architecture

The API client (`src/api/client.ts`) is auto-generated from OpenAPI/Swagger spec (`docs.json`):

- **Base URL**: `r` (proxied to `https://api.pipic.fun`)
- **Server Adapter** (`httpClientAdapter.server.ts`): Forwards cookies, merges headers, calls backend API
- **Client Adapter** (`httpClientAdapter.client.ts`): Standard fetch with credentials
- **Proxy Route**: `/r/*` paths proxy to `https://api.pipic.fun`

### Routing Structure

Routes are defined in `src/routes/index.ts` with three main layout groups:

1. **Public** (`/`): Landing page, terms, privacy
2. **Auth** (`/login`, `/sign-up`, `/forgot`): Authentication pages (redirects if logged in)
3. **Dashboard**: Protected routes requiring auth
   - `/overview` - Main dashboard
   - `/upload` - Video upload
   - `/video` - Video list
   - `/video/:id` - Video detail/edit
   - `/payments-and-plans` - Billing
   - `/notification` - Notifications
   - `/profile` - User settings

Route meta supports `@unhead/vue` for SEO:
```typescript
meta: {
  head: {
    title: "Page Title",
    meta: [{ name: "description", content: "..." }]
  }
}
```

### Styling System (UnoCSS)

Configuration in `uno.config.ts`:

- **Presets**: Wind4 (Tailwind), Typography, Attributify, Bootstrap buttons
- **Custom Colors**:
  - `primary`: #14a74b (green)
  - `accent`: #14a74b
  - `secondary`: #fd7906 (orange)
  - `success`, `info`, `warning`, `danger`
- **Shortcuts**: `press-animated` for button press effects
- **Transformers**: `transformerCompileClass` (prefix: `_`), `transformerVariantGroup`

Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge):
```typescript
import { cn } from '@/lib/utils';
const className = cn('base-class', condition && 'conditional-class');
```

### Component Auto-Import

Components in `src/components/` are auto-imported via `unplugin-vue-components`:

- PrimeVue components resolved via `PrimeVueResolver`
- Custom icons in `src/components/icons/` are auto-imported
- Vue/Pinia/Vue Router APIs auto-imported via `unplugin-auto-import`

No need to manually import `ref`, `computed`, `onMounted`, etc.

### Authentication Flow

- `useAuthStore` manages auth state with cookie-based sessions
- `init()` called on every request to fetch current user via `/me` endpoint
- `beforeEach` router guard redirects unauthenticated users from protected routes
- MQTT client connects on user login for real-time notifications

### File Upload Architecture

Upload queue (`src/composables/useUploadQueue.ts`):
- Supports both local files and remote URLs
- Presigned POST URLs fetched from API
- Parallel chunk upload for large files
- Progress tracking with speed calculation

## Code Style Guidelines

### File Naming Conventions

- **Components**: PascalCase (e.g., `VideoCard.vue`, `DashboardNav.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useUploadQueue.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`, `liteMqtt.ts`)
- **Routes**: PascalCase for page components (e.g., `Overview.vue`)
- **Icons**: PascalCase with `Icon` suffix (e.g., `Bell.vue`, `VideoIcon.vue`)

### Component Patterns

Use Composition API with `<script setup>`:

```vue
<script setup lang="ts">
// Auto-imported: ref, computed, onMounted, etc.
const props = defineProps<{
  video: ModelVideo;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

// Use composables
const auth = useAuthStore();
const route = useRoute();
</script>
```

### TypeScript

- Strict mode enabled
- Use `type` for type aliases
- Interfaces for object shapes
- Always type function parameters and returns

### CSS Class Ordering

Use UnoCSS utility classes in this order:
1. Layout (display, position)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Visuals (bg, border, shadow)
6. Interactivity (hover, focus)

Example:
```html
<div class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
```

## Testing Strategy

**Note**: There are currently no automated test suites (like Vitest) or linting tools (like ESLint/Prettier) configured in this project.

Testing is currently manual:
1. Run `bun dev` for local development testing
2. Use `bun preview` to test production build locally
3. Use `bun run tail` to monitor Cloudflare Worker logs in production

## Deployment Process

### Cloudflare Workers

- **Config**: `wrangler.jsonc`
- **Entry**: `src/index.tsx`
- **Compatibility Date**: 2025-08-03
- **Compatibility Flags**: `nodejs_compat`

### Environment Variables

Cloudflare Worker bindings (configured in `wrangler.jsonc`):
- No explicit secrets in code - use Wrangler secrets management
- Run `bun run cf-typegen` to update TypeScript types after changing bindings

### Deployment Steps

1. Ensure code compiles: `bun run build`
2. Deploy: `bun run deploy`
3. Monitor logs: `bun run tail`

## Security Considerations

- **Cookie-based Auth**: Session cookies are forwarded between client and API
- **CORS**: Configured in Hono middleware
- **CSRF**: Protected by same-origin cookie policy
- **Secrets**: Never commit secrets to code; use Wrangler secrets management

## Important File Locations

| Purpose | Path |
|---------|------|
| Server entry | `src/index.tsx` |
| Client entry | `src/client.ts` |
| App factory | `src/main.ts` |
| Router config | `src/routes/index.ts` |
| API client | `src/api/client.ts` |
| Auth store | `src/stores/auth.ts` |
| SSR plugin | `ssrPlugin.ts` |
| UnoCSS config | `uno.config.ts` |
| Wrangler config | `wrangler.jsonc` |
| Vite config | `vite.config.ts` |

## Development Notes

- Always use `customFetch` from `@httpClientAdapter` for API calls, never raw fetch
- The `honoContext` is provided to Vue app for accessing request context in components
- MQTT client in `src/lib/liteMqtt.ts` handles real-time notifications
- Icons are custom Vue components in `src/components/icons/`
- Upload indicator is a global component showing queue status
- For SEO, use route meta with `@unhead/vue` head configuration
