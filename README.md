# Micro-Frontend Template — Task Board

Open-source GitHub template for building micro-frontends with **Rsbuild + Module Federation + React**. Demoed with a small Task Board app that showcases three core patterns:

- **Zustand MF singleton** — the shell owns a global store (`user`) and exposes it via Module Federation; remotes import it as `shell/store`.
- **Event bus** — remotes talk to each other through `window.CustomEvent` (`@ops/shared-core`), no direct imports between remotes.
- **Theme persistence** — `next-themes` (default dark), no backend involved.

No backend, no auth — user identity is just a name typed into a modal on first load.

## Prerequisites

- Node.js `>= 20`
- [pnpm](https://pnpm.io) `10.33.4` (pinned via `packageManager` in `package.json` — if you have [corepack](https://nodejs.org/api/corepack.html) enabled, this is handled automatically: `corepack enable`)

## Getting started

**1. Install dependencies** (installs for every app/package in the workspace at once)

```bash
pnpm install
```

**2. Start everything in dev mode**

```bash
pnpm dev
```

This runs `shell` (port 3000), `first-app` (port 3001), and `second-app` (port 3002) in parallel via Turborepo. `base-app` is intentionally excluded — it's just a copy-paste skeleton, not part of the running demo (see [Adding a new remote](#adding-a-new-remote)).

**3. Open the app**

Go to [`localhost:3000`](http://localhost:3000) and walk through the flow:

1. A modal asks for your name on first load → type one and hit **Continue**.
2. Click **Tasks** in the sidebar (`/tasks`) — this loads `first-app` live via Module Federation. Add a task, try the `all`/`active`/`completed` filters (reflected in the URL).
3. Click **Stats** (`/stats`) — this loads `second-app`. The counts update in real time as you add/complete/remove tasks on `/tasks`, even if you never left `/stats` — that's the event bus in action.
4. Toggle the theme icon in the header — the whole app (including whichever remote is loaded) switches instantly, and it persists across a page refresh.
5. In dev mode, an **Events** button floats bottom-right — click it to see the event bus traffic (`task:added`, `task:completed`, `task:removed`) as it happens. This is `@ops/ui`'s `EventDebugger`, gated by the `PUBLIC_SHOW_EVENT_DEBUGGER` env var (see below), not by dev/production mode.

**4. (Optional) Run one app standalone**

Each remote also runs on its own, without the shell:

```bash
pnpm --filter @ops/first-app dev   # localhost:3001
pnpm --filter @ops/second-app dev  # localhost:3002
```

Standalone, they still try to read `user` from `shell/store` over Module Federation — if shell isn't running, that part of the UI just renders without a name (not an error).

## Environment variables

Each app has its own `.env.local` (already committed for local dev, gitignored via `.env*` otherwise) pointing at the others' dev ports:

| App | Vars |
|---|---|
| `apps/shell` | `FIRST_APP_URL`, `SECOND_APP_URL` (which remotes to load), `PUBLIC_SHOW_EVENT_DEBUGGER` (show/hide the `EventDebugger` — read at runtime via `import.meta.env`, works the same in dev and in a production build) |
| `apps/first-app` | `FIRST_APP_URL` (its own public URL, used for `assetPrefix`), `SHELL_URL` (to resolve `shell/store`) |
| `apps/second-app` | `SECOND_APP_URL`, `SHELL_URL` |

Changing a URL (e.g. deploying somewhere other than localhost) means updating the relevant `.env.local` or the platform's environment variables — see [`deploy-guide.md`](deploy-guide.md) for the Vercel walkthrough.

## Project structure

```
apps/
  shell/       — HOST (port 3000): layout, routing, Zustand store (exposed via MF)
  first-app/   — REMOTE (port 3001): Task CRUD
  second-app/  — REMOTE (port 3002): Stats panel, updates in real time via the event bus
  base-app/    — Template skeleton (port 3010): copy this to scaffold a new remote

packages/
  shared-config/ — tsconfig + Biome config shared across the workspace
  shared-core/    — event bus, useEventSubscription hook, Zustand store, shared types
  ui/             — shadcn/ui components, Tailwind preset, EventDebugger devtool
```

## Testing

```bash
pnpm test       # Jest + React Testing Library (unit, runs across all apps)
pnpm test:e2e   # Playwright — only apps/shell owns the E2E suite (spins up all 3 dev servers automatically)
```

## Building for production

```bash
pnpm build   # turbo build — outputs dist/ per app (base-app included; it builds fine, just isn't part of the demo)
```

Each app deploys as a **separate** static site (they're independent Module Federation remotes/hosts, not one deployable unit). See [`deploy-guide.md`](deploy-guide.md) for the full Vercel setup (3 projects, env vars, CORS/rewrite config).

## Adding a new remote

See [apps/base-app/README.md](apps/base-app/README.md) — copy `apps/base-app`, replace the placeholders, register it in `apps/shell/rsbuild.config.ts`.

## Non-goals

- No backend (no NestJS, no database, no API).
- No real auth — see [apps/base-app/README.md](apps/base-app/README.md) for how to add it back if you need it.
- No configurable stack — fixed Rsbuild + React; fork and modify as needed.
