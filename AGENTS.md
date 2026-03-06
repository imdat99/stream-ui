# AGENTS.md

This file provides guidance for AI coding agents working with the Holistream codebase.
hallo
## Project Overview

**Holistream** is a Vue 3 streaming application with Server-Side Rendering (SSR) deployed on Cloudflare Workers. It provides video upload, management, and streaming capabilities for content creators.

### Key Characteristics

- **Type**: Full-stack web application with SSR
- **Primary Language**: TypeScript
- **Package Manager**: Bun (evident from `bun.lock`)
- **Deployment Target**: Cloudflare Workers

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Vue | 3.5.27 |
| Router | Vue Router | 5.0.2 |
| Server Framework | Hono | 4.11.7 |
| Build Tool | Vite | 7.3.1 |
| CSS Framework | UnoCSS | 66.6.0 |
| UI Components | PrimeVue | 4.5.4 |
| State Management | Pinia | 3.0.4 |
| Server State | Pinia Colada | 0.21.2 |
| Meta/SEO | @unhead/vue | 2.1.2 |
| Utilities | VueUse | 14.2.0 |
| Validation | Zod | 4.3.6 |
| Deployment | Wrangler | 4.62.0 |

## Project Structure

```
.
├── src/
│   ├── api/                    # API client and HTTP adapters
│   │   ├── client.ts           # Auto-generated API client from OpenAPI spec
│   │   ├── httpClientAdapter.client.ts   # Client-side fetch adapter
│   │   └── httpClientAdapter.server.ts   # Server-side fetch adapter
│   ├── client.ts               # Client entry point (hydration)
│   ├── components/             # Vue components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── icons/              # Custom icon components
│   │   ├── ui/                 # UI primitive components
│   │   ├── ClientOnly.tsx      # SSR-safe client-only wrapper
│   │   ├── DashboardLayout.vue # Main dashboard layout
│   │   ├── GlobalUploadIndicator.vue
│   │   ├── NotificationDrawer.vue
│   │   └── RootLayout.vue      # Root application layout
│   ├── composables/            # Vue composables
│   │   └── useUploadQueue.ts   # Upload queue management
│   ├── index.tsx               # Server entry point (Hono app)
│   ├── lib/                    # Utility libraries
│   │   ├── constants.ts        # Application constants
│   │   ├── directives/         # Custom Vue directives
│   │   ├── hoc/                # Higher-order components
│   │   ├── interface.ts        # TypeScript interfaces
│   │   ├── liteMqtt.ts         # MQTT client (browser)
│   │   ├── manifest.ts         # Vite manifest utilities
│   │   ├── PiniaSharedState.ts # Pinia state hydration plugin
│   │   ├── primePassthrough.ts # PrimeVue theme configuration
│   │   ├── replateStreamText.ts
│   │   └── utils.ts            # Utility functions (cn, formatters, etc.)
│   ├── main.ts                 # App factory function
│   ├── mocks/                  # Mock data for development
│   ├── routes/                 # Route components (page components)
│   │   ├── auth/               # Authentication pages
│   │   ├── home/               # Public pages (landing, terms, privacy)
│   │   ├── notification/       # Notification page
│   │   ├── overview/           # Dashboard overview
│   │   ├── plans/              # Payments & plans
│   │   ├── profile/            # User profile
│   │   ├── upload/             # Video upload
│   │   ├── video/              # Video management
│   │   ├── index.ts            # Router configuration
│   │   └── NotFound.vue        # 404 page
│   ├── server/                 # Server-side utilities
│   │   └── modules/
│   │       └── merge.ts        # Video chunk merge logic
│   ├── stores/                 # Pinia stores
│   │   └── auth.ts             # Authentication store
│   ├── type.d.ts               # TypeScript declarations
│   └── worker/                 # Worker utilities
│       ├── html.ts
│       └── ssrLayout.ts
├── bootstrap_btn.ts            # Bootstrap button preset for UnoCSS
├── ssrPlugin.ts                # Custom Vite SSR plugin
├── uno.config.ts               # UnoCSS configuration
├── vite.config.ts              # Vite configuration
├── wrangler.jsonc              # Cloudflare Workers configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Package dependencies
├── bun.lock                    # Bun lock file
├── docs.json                   # OpenAPI/Swagger spec for API
├── auto-imports.d.ts           # Auto-generated type declarations
└── components.d.ts             # Auto-generated component declarations
```

## Build and Development Commands

```bash
# Install dependencies
bun install

# Start development server with hot reload
bun dev

# Build for production (client + worker)
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

> **Note**: While npm commands work (`npm run dev`, etc.), the project uses Bun as its primary package manager.

## Architecture Details

### SSR Architecture

The application uses a custom SSR setup defined in `ssrPlugin.ts`:

1. **Build Order**: Client bundle is built FIRST, then the Worker bundle
2. **Manifest Injection**: Vite manifest is injected into the server build for asset rendering
3. **Environment-based Resolution**: `httpClientAdapter` and `liteMqtt` resolve to different implementations based on SSR context

**Entry Points:**
- **Server**: `src/index.tsx` - Hono app that renders Vue SSR stream
- **Client**: `src/client.ts` - Hydrates the SSR-rendered application
- **App Factory**: `src/main.ts` - Creates the Vue app instance (used by both)

### State Management with SSR

Uses **Pinia Colada** for server state with SSR hydration:

- Server-side queries are fetched and serialized to `window.__APP_DATA__`
- Client hydrates the query cache via `hydrateQueryCache()`
- Pinia state is serialized and restored via `PiniaSharedState` plugin

### Module Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

| Alias | Resolution |
|-------|------------|
| `@/` | `src/` |
| `@httpClientAdapter` | `src/api/httpClientAdapter.server.ts` (SSR) or `.client.ts` (browser) |
| `@liteMqtt` | `src/lib/liteMqtt.server.ts` (SSR) or `.ts` (browser) |

### API Client Architecture

The API client (`src/api/client.ts`) is **auto-generated** from the OpenAPI spec (`docs.json`):

- Uses `customFetch` adapter that differs between client/server
- **Server adapter** (`httpClientAdapter.server.ts`): Forwards cookies, merges headers, proxies to `api.pipic.fun`
- **Client adapter** (`httpClientAdapter.client.ts`): Standard fetch with credentials
- API proxy route: `/r/*` paths proxy to `https://api.pipic.fun`

### Routing Structure

Routes are defined in `src/routes/index.ts` with three main layout groups:

1. **Public** (`/`): Landing page, terms, privacy
2. **Auth** (`/login`, `/sign-up`, `/forgot`): Authentication pages (redirects if logged in)
3. **Dashboard**: Protected routes requiring authentication
   - `/overview` - Main dashboard
   - `/upload` - Video upload with queue management
   - `/video` - Video list
   - `/video/:id` - Video detail/edit
   - `/payments-and-plans` - Billing management
   - `/notification`, `/profile` - User settings

Route meta supports `@unhead/vue` for SEO:
```ts
meta: { 
  head: { 
    title: "Page Title", 
    meta: [{ name: "description", content: "..." }] 
  } 
}
```

### Styling System (UnoCSS)

Configuration in `uno.config.ts`:

- **Presets**: Wind4 (Tailwind-like), Typography, Attributify, Bootstrap buttons
- **Custom Colors**: 
  - `primary` (#14a74b)
  - `secondary` (#fd7906)
  - `accent`, `success`, `info`, `warning`, `danger`
- **Shortcuts**: `press-animated` for button press effects
- **Transformers**: 
  - `transformerCompileClass` (prefix: `_` for compiled classes)
  - `transformerVariantGroup`

Use `cn()` from `src/lib/utils.ts` for conditional class merging (combines `clsx` + `tailwind-merge`).

### Component Auto-Import

Components are auto-imported via `unplugin-vue-components`:

- PrimeVue components resolved via `PrimeVueResolver`
- Vue/Pinia/Vue Router APIs auto-imported via `unplugin-auto-import`
- Type declarations auto-generated to `components.d.ts` and `auto-imports.d.ts`

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **JSX/TSX**: Supported for components (import source: `vue`)
- **CSS**: Use UnoCSS utility classes; custom CSS in component `<style>` blocks when needed

### File Organization

- Page components go in `src/routes/` following the route structure
- Reusable components go in `src/components/`
- Composables go in `src/composables/`
- Stores go in `src/stores/`
- Server utilities go in `src/server/`

### HTTP Requests

**Always use the generated API client** instead of raw fetch:

```ts
import { client } from '@/api/client';

// Example
const response = await client.auth.loginCreate({ email, password });
```

The client handles:
- Base URL resolution
- Cookie forwarding (server-side)
- Type safety

### Authentication Flow

- `useAuthStore` manages auth state with cookie-based sessions
- `init()` is called on every request to fetch current user via `/me` endpoint
- `beforeEach` router guard redirects unauthenticated users from protected routes
- MQTT client connects on user login for real-time notifications

### File Upload Architecture

Upload queue (`src/composables/useUploadQueue.ts`):

- Supports both local files and remote URLs
- Presigned POST URLs fetched from API
- Parallel chunk upload (90MB chunks, max 3 parallel)
- Progress tracking with speed calculation

### Type Safety

- TypeScript strict mode enabled
- `CloudflareBindings` interface for environment variables (generated via `cf-typegen`)
- API types auto-generated from backend OpenAPI spec (`docs.json`)

## Environment Configuration

### Cloudflare Worker Bindings

Configured in `wrangler.jsonc`:

```json
{
  "name": "holistream",
  "compatibility_date": "2025-08-03",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { ... }
}
```

- No explicit secrets in code - use Wrangler secrets management
- Access environment variables via Hono context: `c.env.VAR_NAME`

### Local Environment

Create `.dev.vars` for local development secrets (do not commit):

```
SECRET_KEY=...
```

## Testing and Quality

**Current Status**: There are currently no automated test suites (like Vitest) or linting tools (like ESLint/Prettier) configured.

When adding tests or linting:
- Add appropriate dev dependencies
- Update this section with commands and conventions
- Consider the SSR environment when writing tests

## Security Considerations

1. **Cookie Security**: Cookies are httpOnly, secure, and sameSite
2. **CORS**: Configured via Hono's CORS middleware
3. **API Proxy**: Backend API is never exposed directly to the browser; all requests go through `/r/*` proxy
4. **Input Validation**: Use Zod for runtime validation
5. **XSS Protection**: HTML escaping is applied to SSR data via `htmlEscape()` function

## Common Patterns

### Creating a New Page

1. Create component in `src/routes/<section>/PageName.vue`
2. Add route to `src/routes/index.ts` with appropriate meta
3. Use `head` in route meta for SEO if needed

### Using the Upload Queue

```ts
import { useUploadQueue } from '@/composables/useUploadQueue';

const { items, addFiles, addRemoteUrls, startQueue } = useUploadQueue();
```

### Accessing Hono Context in Components

```ts
import { inject } from 'vue';

const honoContext = inject('honoContext');
```

### Conditional Classes

```ts
import { cn } from '@/lib/utils';

const className = cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'text-primary' : 'text-secondary'
);
```

## External Dependencies

- **Backend API**: `https://api.pipic.fun`
- **MQTT Broker**: `wss://mqtt-dashboard.com:8884/mqtt`
- **Fonts**: Google Fonts (Google Sans loaded from fonts.googleapis.com)

## Important Files Reference

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

---

*This document was generated for AI coding agents. For human contributors, see README.md.*
