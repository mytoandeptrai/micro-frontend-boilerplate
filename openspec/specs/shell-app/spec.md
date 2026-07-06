# shell-app

## Purpose

Defines requirements for the shell application including scaffold structure, bootstrap pattern, Module Federation host configuration, TailwindCSS setup, routing, and layout components.

## Requirements

### Requirement: Shell app có đầy đủ scaffold files
`apps/shell` SHALL chứa tối thiểu: `rsbuild.config.ts`, `src/index.tsx`, `src/bootstrap.tsx`, `src/App.tsx`, `package.json`, `tsconfig.json`.

#### Scenario: Scaffold files tồn tại
- **WHEN** liệt kê nội dung `apps/shell`
- **THEN** tất cả files bắt buộc phải tồn tại

### Requirement: Bootstrap pattern được áp dụng
`src/index.tsx` SHALL chỉ chứa một dynamic import: `import('./bootstrap')`. Toàn bộ app initialization SHALL nằm trong `src/bootstrap.tsx`.

#### Scenario: index.tsx chỉ có dynamic import
- **WHEN** đọc nội dung `src/index.tsx`
- **THEN** file chỉ chứa `import('./bootstrap')` (hoặc tương đương async import), không có React imports hay ReactDOM.render ở top level

#### Scenario: App render bình thường sau khi tách bootstrap
- **WHEN** truy cập `localhost:3000` sau khi chạy `pnpm dev` trong `apps/shell`
- **THEN** app render và không có lỗi trong console

### Requirement: Shell được config là Module Federation host
`rsbuild.config.ts` SHALL sử dụng `pluginModuleFederation` với `name: "shell"`, `remotes: {}`, và shared deps đúng chuẩn.

#### Scenario: MF host config hợp lệ
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build thành công không có lỗi Module Federation config

#### Scenario: Shared deps được config singleton
- **WHEN** đọc `rsbuild.config.ts`
- **THEN** `react` và `react-dom` có `singleton: true, eager: true`; `react-router-dom`, `@tanstack/react-query`, `zustand` có `singleton: true`

### Requirement: TailwindCSS v4 hoạt động trong shell
`apps/shell` SHALL có TailwindCSS v4 được cài đặt và extend từ `@ops/ui/tailwind.preset`.

#### Scenario: Tailwind classes áp dụng được trong components
- **WHEN** một component trong shell dùng Tailwind utility class (ví dụ: `className="flex items-center"`)
- **THEN** styles được áp dụng đúng khi render tại `localhost:3000`

### Requirement: React Router v6 setup với routes
Shell SHALL define các routes sau trong một `RouteObject[]` array:
- `/login` → `<GuestRoute><LoginPage /></GuestRoute>`
- `/` (layout: AppLayout với Header + Sidebar) → protected bởi `<ProtectedRoute>`:
  - index → `<DashboardPage />`
  - `team/*` → `<TeamApp />` (lazy, Remote 1)
  - `monitor/*` → `<MonitorApp />` (lazy, Remote 2)
  - `settings/*` → `<SettingsApp />` (lazy, Remote 3)
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

### Requirement: Header component render app title và user placeholder
`src/layout/Header.tsx` SHALL hiển thị app title "Ops Dashboard" và một user avatar/name placeholder.

#### Scenario: Header hiển thị đúng nội dung
- **WHEN** render `<Header />`
- **THEN** element có text "Ops Dashboard" xuất hiện trong DOM

### Requirement: Sidebar component render nav links và highlight active route
`src/layout/Sidebar.tsx` SHALL render navigation links tới `/`, `/team`, `/monitor`, `/settings` và highlight link của route hiện tại.

#### Scenario: Sidebar render đủ 4 nav links
- **WHEN** render `<Sidebar />` bên trong `BrowserRouter`
- **THEN** 4 navigation links tồn tại trong DOM

#### Scenario: Sidebar highlight active link
- **WHEN** current route là `/team`
- **THEN** nav link tới `/team` có active indicator (class hoặc aria-current)

#### Scenario: Sidebar links navigate đúng route
- **WHEN** click vào nav link `/monitor` trong Sidebar
- **THEN** URL thay đổi thành `/monitor` và Monitor page content hiển thị

### Requirement: AuthInitializer khởi tạo auth state khi app load
`src/components/AuthInitializer.tsx` SHALL gọi `GET /api/auth/me` một lần khi mount. Trước khi gọi: `setLoading(true)`. Nếu 200: `setUser(member)`, `setAuthenticated(true)`, `setLoading(false)`. Nếu 401: `setUser(null)`, `setAuthenticated(false)`, `setLoading(false)`. Component này KHÔNG dùng bất kỳ React Router hook nào — đặt bên ngoài `<BrowserRouter>` trong `bootstrap.tsx`.

#### Scenario: Session được khôi phục khi cookie còn hiệu lực
- **WHEN** user refresh trang khi cookie `ops_token` còn hiệu lực
- **THEN** `GET /api/auth/me` trả về 200, `isAuthenticated = true`, `user` được set, `isLoading = false`

#### Scenario: Không có session khi không có cookie
- **WHEN** user truy cập app lần đầu (không có cookie)
- **THEN** `GET /api/auth/me` trả về 401, `isAuthenticated = false`, `user = null`, `isLoading = false`

### Requirement: ProtectedRoute bảo vệ routes với loading state và returnUrl
`src/components/ProtectedRoute.tsx` SHALL đọc `isLoading` và `isAuthenticated` từ Zustand store. Render priority: (1) `isLoading === true` → render spinner; (2) `!isAuthenticated` → `<Navigate to="/login" state={{ returnUrl: location.pathname }} replace />`; (3) authenticated → render `children`.

#### Scenario: ProtectedRoute render spinner khi đang loading
- **WHEN** render `<ProtectedRoute>` với `isLoading === true` trong store
- **THEN** spinner hiển thị, không redirect, không render children

#### Scenario: ProtectedRoute redirect khi chưa auth (sau khi loading xong)
- **WHEN** render `<ProtectedRoute>` với `isLoading === false` và `isAuthenticated === false`
- **THEN** component render `<Navigate to="/login" />` với `state.returnUrl` là pathname hiện tại

#### Scenario: ProtectedRoute render children khi đã auth
- **WHEN** render `<ProtectedRoute>` với `isLoading === false` và `isAuthenticated === true`
- **THEN** children được render bình thường

### Requirement: GuestRoute ngăn user đã auth vào login page
`src/components/GuestRoute.tsx` SHALL đọc `isAuthenticated` từ Zustand store. Nếu `isAuthenticated === true` → `<Navigate to="/" replace />`. Nếu `isAuthenticated === false` → render `children`.

#### Scenario: GuestRoute redirect khi đã auth
- **WHEN** render `<GuestRoute>` với `isAuthenticated === true` trong store
- **THEN** component redirect về `/`, không render login form

#### Scenario: GuestRoute render children khi chưa auth
- **WHEN** render `<GuestRoute>` với `isAuthenticated === false` trong store
- **THEN** children (login form) được render bình thường

### Requirement: Shell expose ./store qua Module Federation
`rsbuild.config.ts` SHALL có `exposes: { './store': '@ops/shared/store' }` trong MF config, ngoài các remotes hiện có.

#### Scenario: Build expose store thành công
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build output có `remoteEntry.js` với exposed `./store` module

### Requirement: Header hiển thị tên user đang đăng nhập
`Header.tsx` SHALL hiển thị `user.name` từ Zustand store khi user đã đăng nhập. SHALL có logout button gọi `POST /api/auth/logout` rồi `setUser(null)`, `setAuthenticated(false)`, và redirect `/login`.

#### Scenario: Header hiển thị tên user
- **WHEN** render `<Header />` với user đã đăng nhập trong store
- **THEN** `user.name` xuất hiện trong Header DOM

#### Scenario: Logout clear session và redirect
- **WHEN** user click Logout button
- **THEN** `POST /api/auth/logout` được gọi, `isAuthenticated = false`, `user = null` trong store, redirect về `/login`

### Requirement: Shell config monitorApp remote qua env
Shell rsbuild.config.ts SHALL include `monitorApp` trong remotes:
```
monitorApp: `monitorApp@${MONITOR_APP_URL}/mf-manifest.json`
```
`MONITOR_APP_URL` MUST đọc từ environment variable với default `http://localhost:3002`.

#### Scenario: MONITOR_APP_URL override cho production
- **WHEN** `MONITOR_APP_URL` env var được set
- **THEN** remote manifest URL sử dụng giá trị đó

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

### Requirement: EventDebugger mount trong DEV mode
Shell App.tsx SHALL conditionally render `<EventDebugger />` từ `@ops/ui`:
`{import.meta.env.DEV && <EventDebugger />}`

#### Scenario: DEV mode có EventDebugger
- **WHEN** shell chạy với DEV=true
- **THEN** EventDebugger floating button xuất hiện trong UI
