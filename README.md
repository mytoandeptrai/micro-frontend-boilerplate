# Micro-Frontend Template — Task Board

Open-source GitHub template for building micro-frontends with **Rsbuild + Module Federation + React**. Demoed with a small Task Board app that showcases the three core patterns:

- **Zustand MF singleton** — shell owns a global store (`user`) and exposes it via Module Federation; remotes import it as `shell/store`.
- **Event bus** — remotes talk to each other through `window.CustomEvent` (`@ops/shared-core`), no direct imports between remotes.
- **Theme persistence** — `next-themes` (default dark), no backend involved.

No backend, no auth — user identity is just a name typed into a modal on first load.

## Structure

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

## Quick start

```bash
pnpm install
pnpm dev
```

- `localhost:3000` — shell (layout, name prompt, theme toggle)
- `localhost:3000/tasks` — first-app loaded via Module Federation
- `localhost:3000/stats` — second-app loaded via Module Federation, updates live
- `localhost:3001` / `localhost:3002` / `localhost:3010` — each remote also runs standalone

## Adding a new remote

See [apps/base-app/README.md](apps/base-app/README.md) — copy `apps/base-app`, replace the placeholders, register it in `apps/shell/rsbuild.config.ts`.

## Testing

```bash
pnpm test       # Jest + React Testing Library (unit)
pnpm test:e2e   # Playwright (from apps/shell)
```

## Non-goals

- No backend (no NestJS, no database, no API).
- No real auth — see [apps/base-app/README.md](apps/base-app/README.md) for how to add it back if you need it.
- No configurable stack — fixed Rsbuild + React; fork and modify as needed.
