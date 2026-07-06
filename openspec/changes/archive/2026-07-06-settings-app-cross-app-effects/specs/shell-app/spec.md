## MODIFIED Requirements

### Requirement: React Router v6 setup với routes
Shell SHALL define các routes sau trong một `RouteObject[]` array:
- `/login` → `<GuestRoute><LoginPage /></GuestRoute>`
- `/` (layout: AppLayout với Header + Sidebar) → protected bởi `<ProtectedRoute>`:
  - index → `<DashboardPage />`
  - `team/*` → `<TeamApp />` (lazy, Remote 1)
  - `monitor/*` → `<MonitorApp />` (lazy, Remote 2)
  - `settings` → `<SettingsApp />` (lazy, Remote 3)
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

#### Scenario: Route /login render được khi chưa auth
- **WHEN** truy cập `localhost:3000/login` khi chưa đăng nhập
- **THEN** Login page form hiển thị, không redirect

#### Scenario: Route /login redirect về / khi đã auth
- **WHEN** truy cập `localhost:3000/login` khi đã đăng nhập (cookie hợp lệ)
- **THEN** `GuestRoute` redirect về `localhost:3000/`

#### Scenario: Route / redirect về /login khi chưa auth
- **WHEN** truy cập `localhost:3000/` khi chưa đăng nhập (không có cookie)
- **THEN** `ProtectedRoute` redirect về `localhost:3000/login`

#### Scenario: returnUrl được giữ lại sau redirect
- **WHEN** truy cập `localhost:3000/team` khi chưa đăng nhập
- **THEN** redirect về `/login` với `state.returnUrl === '/team'`, sau khi login thành công redirect về `/team`

#### Scenario: Route / render được sau khi auth
- **WHEN** truy cập `localhost:3000/` sau khi đăng nhập thành công
- **THEN** Dashboard content hiển thị, không bị redirect

#### Scenario: Route /team render được sau khi auth
- **WHEN** truy cập `localhost:3000/team` sau khi đăng nhập
- **THEN** Team content hiển thị không có lỗi routing

#### Scenario: Route /settings render được sau khi auth
- **WHEN** truy cập `localhost:3000/settings` sau khi đăng nhập
- **THEN** `settings-app` remote được lazy load và render (không còn placeholder tĩnh)

## ADDED Requirements

### Requirement: Shell config settingsApp remote qua env
Shell `rsbuild.config.ts` SHALL include `settingsApp` trong `remotes`:
```
settingsApp: `settingsApp@${SETTINGS_APP_URL}/mf-manifest.json`
```
`SETTINGS_APP_URL` MUST đọc từ environment variable với default `http://localhost:3003`.

#### Scenario: SETTINGS_APP_URL override cho production
- **WHEN** `SETTINGS_APP_URL` env var được set
- **THEN** remote manifest URL sử dụng giá trị đó

#### Scenario: Navigate tới /settings load SettingsApp
- **WHEN** authenticated user navigate tới `/settings`
- **THEN** `SettingsApp` remote được lazy load và render qua MF
