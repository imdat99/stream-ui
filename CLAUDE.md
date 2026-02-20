# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Holistream is a Vue 3 streaming application with Server-Side Rendering (SSR) deployed on Cloudflare Workers. It provides video upload, management, and streaming capabilities.

## Technology Stack

- **Framework**: Vue 3 with JSX/TSX support
- **Router**: Vue Router 5 with SSR-aware history
- **Server**: Hono framework on Cloudflare Workers
- **Build Tool**: Vite 7 with custom SSR plugin
- **Styling**: UnoCSS (Tailwind-like utility-first CSS)
- **UI Components**: PrimeVue 4 with Aura theme
- **State Management**: Pinia + Pinia Colada for server state
- **HTTP Client**: Auto-generated from OpenAPI spec via swagger-typescript-api
- **Package Manager**: Bun

## Common Commands

```bash
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

## Architecture

### SSR Architecture

The app uses a custom SSR setup (`ssrPlugin.ts`) that:
- Builds the client bundle FIRST, then the Worker bundle
- Injects the Vite manifest into the server build for asset rendering
- Uses environment-based module resolution for `httpClientAdapter` and `liteMqtt`

Entry points:
- **Server**: `src/index.tsx` - Hono app that renders Vue SSR stream
- **Client**: `src/client.ts` - Hydrates the SSR-rendered app

### Module Aliases

- `@/` → `src/`
- `@httpClientAdapter` → `src/api/httpClientAdapter.server.ts` (SSR) or `.client.ts` (browser)
- `@liteMqtt` → `src/lib/liteMqtt.server.ts` (SSR) or `.ts` (browser)

### State Management Pattern

Uses **Pinia Colada** for server state with SSR hydration:
- Queries are fetched server-side and serialized to `window.__APP_DATA__`
- Client hydrates the query cache on startup via `hydrateQueryCache()`
- Pinia state is similarly serialized and restored via `PiniaSharedState` plugin

### API Client Architecture

The API client (`src/api/client.ts`) is auto-generated from OpenAPI spec:
- Uses `customFetch` adapter that differs between client/server
- Server adapter (`httpClientAdapter.server.ts`): Forwards cookies, merges headers, calls `api.pipic.fun`
- Client adapter (`httpClientAdapter.client.ts`): Standard fetch with credentials
- API proxy route: `/r/*` paths proxy to `https://api.pipic.fun`

### Routing Structure

Routes are defined in `src/routes/index.ts` with three main layouts:
1. **Public** (`/`): Landing page, terms, privacy
2. **Auth** (`/login`, `/sign-up`, `/forgot`): Authentication pages (redirects if logged in)
3. **Dashboard**: Protected routes requiring auth
   - `/overview` - Main dashboard
   - `/upload` - Video upload
   - `/video` - Video list
   - `/video/:id` - Video detail/edit
   - `/payments-and-plans` - Billing
   - `/notification`, `/profile` - User settings

Route meta supports `@unhead/vue` for SEO: `meta: { head: { title, meta: [...] } }`

### Styling System (UnoCSS)

Configuration in `uno.config.ts`:
- **Presets**: Wind4 (Tailwind), Typography, Attributify, Bootstrap buttons
- **Custom colors**: `primary` (#14a74b), `accent`, `secondary` (#fd7906), `success`, `info`, `warning`, `danger`
- **Shortcuts**: `press-animated` for button press effects
- **Transformers**: `transformerCompileClass` (prefix: `_`), `transformerVariantGroup`

Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge).

### Component Auto-Import

Components in `src/components/` are auto-imported via `unplugin-vue-components`:
- PrimeVue components resolved via `PrimeVueResolver`
- Vue/Pinia/Vue Router APIs auto-imported via `unplugin-auto-import`

### Auth Flow

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

### Type Safety

- TypeScript strict mode enabled
- `CloudflareBindings` interface for environment variables (generated via `cf-typegen`)
- API types auto-generated from backend OpenAPI spec

### Environment Variables

Cloudflare Worker bindings (configured in `wrangler.jsonc`):
- No explicit secrets in code - use Wrangler secrets management
- `compatibility_date`: "2025-08-03"
- `compatibility_flags`: ["nodejs_compat"]

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
- MQTT client in `src/lib/liteMqtt.ts` (using `TinyMqttClient`) handles real-time notifications
- Icons are custom Vue components in `src/components/icons/`
- Upload indicator is a global component showing queue status
- **Testing & Linting**: There are currently no automated test suites (like Vitest) or linting tools (like ESLint/Prettier) configured.
