## MODIFIED Requirements

### Requirement: React Router v6 setup với routes
Shell SHALL define các routes sau trong một `RouteObject[]` array:
- `/login` → `<GuestRoute><LoginPage /></GuestRoute>`
- `/` (layout: AppLayout với Header + Sidebar) → protected bởi `<ProtectedRoute>`:
  - index → `<DashboardPage />`
  - `team/*` → `<TeamApp />` (lazy, Remote 1)
  - `monitor/*` → `<MonitorApp />` (lazy, Remote 2)
  - `settings` → `<SettingsPage />`
  - `monitor` → `<MonitorPage />` (local, đã có)
- `*` → redirect về `/`

#### Scenario: Navigate tới /monitor load MonitorApp
- **WHEN** authenticated user navigate tới `/monitor`
- **THEN** MonitorApp remote được lazy load và render

#### Scenario: Navigate tới /team load TeamApp
- **WHEN** authenticated user navigate tới `/team`
- **THEN** TeamApp remote được lazy load và render

#### Scenario: Unauthenticated user redirect về /login
- **WHEN** unauthenticated user truy cập protected route
- **THEN** user bị redirect về `/login` với returnUrl

#### Scenario: Authenticated user truy cập /login redirect về /
- **WHEN** authenticated user truy cập `/login`
- **THEN** user bị redirect về `/`

## ADDED Requirements

### Requirement: Shell config monitorApp remote qua env
Shell rsbuild.config.ts SHALL include `monitorApp` trong remotes:
```
monitorApp: `monitorApp@${MONITOR_APP_URL}/mf-manifest.json`
```
`MONITOR_APP_URL` MUST đọc từ environment variable với default `http://localhost:3002`.

#### Scenario: MONITOR_APP_URL override cho production
- **WHEN** `MONITOR_APP_URL` env var được set
- **THEN** remote manifest URL sử dụng giá trị đó

### Requirement: EventDebugger mount trong DEV mode
Shell App.tsx SHALL conditionally render `<EventDebugger />` từ `@ops/ui`:
`{import.meta.env.DEV && <EventDebugger />}`

#### Scenario: DEV mode có EventDebugger
- **WHEN** shell chạy với DEV=true
- **THEN** EventDebugger floating button xuất hiện trong UI
