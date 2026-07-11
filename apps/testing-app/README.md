# apps/base-app

A standard scaffold for creating a new remote MFE in this monorepo — copy it directly from `apps/base-app`.

## How to create a new remote

1. **Copy this folder** to `apps/<new-app-name>` (example: `apps/reports-app`).
2. **Replace the placeholders** in every copied file:
   - `baseApp` → camelCase name, example `reportsApp` (used as the MF container name and the `@ops/<name>` package name)
   - `base-app` → kebab-case name, example `reports-app` (used as the `BrowserRouter` basename when running standalone)
   - `3010` → your own dev port, not used by another app (example `3011`)
   - Update the env vars in `.env.example`/`.env.local` (`BASE_APP_URL` → `REPORTS_APP_URL`)
3. **Register the remote in shell**:
   - Add it to `remotes` in `apps/shell/rsbuild.config.ts`: `<appName>: '<appName>@${<APP_NAME>_URL}/mf-manifest.json'`
   - Add a lazy-loaded route in `apps/shell/src/App.tsx` pointing to `<appName>/App`
   - Add a matching nav link in `apps/shell/src/layout/Sidebar.tsx`

After step 2, `pnpm dev` in the new app folder already runs standalone (step 3 is not required yet).

## No auth

This monorepo has no backend and no auth flow. If you need to protect routes or add roles:

- Put the auth logic (session, token, redirect) in the `shell` layer — a remote app should not check permissions on its own.
- Suggested pattern: wrap routes in shell with a `ProtectedRoute`-style component that reads login state from the Zustand store (`@ops/shared-core`) or your own backend.
- No auth code is implemented in this template — this is only a suggestion, build it based on your own needs.
