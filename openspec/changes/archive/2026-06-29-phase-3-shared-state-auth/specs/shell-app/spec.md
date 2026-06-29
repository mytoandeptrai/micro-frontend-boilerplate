## MODIFIED Requirements

### Requirement: React Router v6 setup với routes
Shell SHALL dùng `useRoutes` với layout-level protection. Route groups:
- **Guest group** (wrap bởi `GuestRoute`): `/login`
- **Protected group** (wrap bởi `ProtectedRoute`): `/`, `/team`, `/monitor`, `/settings`
- **Catch-all**: redirect về `/`

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

#### Scenario: Route /monitor render được sau khi auth
- **WHEN** truy cập `localhost:3000/monitor` sau khi đăng nhập
- **THEN** Monitor placeholder content hiển thị

#### Scenario: Route /settings render được sau khi auth
- **WHEN** truy cập `localhost:3000/settings` sau khi đăng nhập
- **THEN** Settings placeholder content hiển thị

## ADDED Requirements

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
