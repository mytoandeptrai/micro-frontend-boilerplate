## Context

Phase 1+2 đã có: monorepo với pnpm workspaces + Turborepo, shell host app (port 3000), team-app remote (port 3001), NestJS API (port 4000) với Member CRUD (không có password), `@ops/ui` package với shadcn components.

Hiện tại shell không có auth — mọi route đều public, không có cơ chế nào để remote app biết user là ai. `@ops/shared` chưa tồn tại. Shell expose chưa có `./store` trong MF config.

Ràng buộc kỹ thuật:
- Build tool là Rsbuild (Rspack), không phải Vite — cần dùng `@module-federation/rsbuild-plugin`
- MF shared deps phải config `singleton: true` để tránh duplicate instances — đặc biệt quan trọng với Zustand vì store là singleton
- Bootstrap pattern (`index.tsx` → dynamic import `bootstrap.tsx`) bắt buộc ở mọi app để MF negotiate shared deps trước khi app code chạy
- Cookie httpOnly không accessible từ JS — đây là lý do chọn cookie thay vì localStorage cho JWT

## Goals / Non-Goals

**Goals:**
- Zustand store singleton tại `@ops/shared`, expose qua shell MF để tất cả remote đọc cùng 1 instance
- Store shape: `user`, `isAuthenticated`, `isLoading`, `theme` — explicit flags thay vì derive runtime
- JWT auth với httpOnly cookie: login/logout/me endpoints tại NestJS
- `AuthInitializer`: gọi `/api/auth/me` khi app load, set store, không dùng router hooks
- `GuestRoute`: redirect về `/` nếu đã auth (bảo vệ `/login`)
- `ProtectedRoute`: redirect về `/login` với `returnUrl`, handle `isLoading` spinner
- Route structure: layout-level protection với `useRoutes`
- Role-based UI tại team-app: ẩn/hiện buttons theo role
- Theme toggle tại shell Header với `next-themes`, persist localStorage

**Non-Goals:**
- Refresh token
- JwtAuthGuard trên members endpoints (Phase sau)
- Event bus (Phase 4)
- Monitor-app, settings-app (Phase 4, 5)

## Decisions

### D1: Zustand store ở `@ops/shared`, expose qua shell MF

**Quyết định:** `@ops/shared/store` chứa `useStore` (Zustand). Shell expose `'./store': '@ops/shared/store'` trong MF config. Team-app import `'shell/store'`.

**Lý do:** Remote apps không được import trực tiếp từ remote khác. Cách duy nhất để share store singleton qua MF boundary là host (shell) expose nó. `@ops/shared` là package code, nhưng runtime instance chạy trong shell bundle vì shell là entry point. Khi team-app import `shell/store`, nó nhận đúng cái store instance đang chạy trong shell — đảm bảo singleton.

**Alternative bị loại:** Để mỗi remote có store riêng + sync qua event bus → phức tạp hơn, dễ out-of-sync, event bus chưa có ở Phase 3.

### D2: JWT trong httpOnly cookie thay vì localStorage

**Quyết định:** Sau khi login thành công, API set JWT vào httpOnly cookie (SameSite=Lax). Frontend không bao giờ đọc token trực tiếp.

**Lý do:** httpOnly cookie không accessible từ JS → chặn XSS attack lấy token. Cookie tự động gửi kèm mọi request cùng origin → không cần manually attach Authorization header.

**Downside:** Cần CSRF consideration khi production (SameSite=Lax đã mitigate phần lớn). Dev environment không cần lo vì localhost.

**Alternative bị loại:** localStorage/sessionStorage → dễ bị XSS. Authorization header với memory store → mất khi refresh.

### D3: AuthInitializer + GuestRoute + ProtectedRoute — tách trách nhiệm rõ ràng

**Quyết định:** Chia auth routing thành 3 component với trách nhiệm riêng biệt:

**`AuthInitializer`** — mount bên ngoài `<BrowserRouter>` trong `bootstrap.tsx`. Gọi `GET /api/auth/me` một lần khi app load. Set `isLoading: true` khi bắt đầu, set `user` + `isAuthenticated` + `isLoading: false` sau khi có response. Không dùng bất kỳ React Router hook nào — chỉ thuần Zustand + fetch.

**`ProtectedRoute`** — mount bên trong Router (trong `<Routes>`), có thể dùng `useLocation` và `<Navigate>`. Logic:
```
isLoading === true  → render <Spinner />
!isAuthenticated    → <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />
isAuthenticated     → render children
```
`returnUrl` được save vào location state để Login page redirect đúng trang sau khi auth thành công.

**`GuestRoute`** — wrap `/login` route. Nếu `isAuthenticated === true` → `<Navigate to="/" replace />`. Ngăn user đã login vào lại trang login.

**Route structure dùng `useRoutes` với layout-level protection** thay vì wrap từng route riêng:
```tsx
const routes: RouteObject[] = [
  {
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [{ path: '/login', element: <Login /> }],
  },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/team', element: <TeamApp /> },
      { path: '/monitor', element: <Monitor /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
```

**Lý do tách `AuthInitializer` ra ngoài Router:** `AuthInitializer` chỉ fetch + set store, không cần router hooks. Đặt ngoài Router là đúng vì nó không phụ thuộc routing. `ProtectedRoute` bên trong Router mới là nơi quyết định redirect — đây là nơi duy nhất cần `useLocation`.

**Lý do `GuestRoute`:** Không có GuestRoute, user đã login vào `/login` sẽ thấy form login thay vì bị redirect — UX xấu và confusing.

**Lý do layout-level protection:** Wrap từng route riêng lẻ là repetitive và dễ miss route mới. Wrap ở layout level đảm bảo toàn bộ group được protect, code cleaner.

**Alternative bị loại:** Dùng React Context để share auth state thay vì Zustand store — Context không cross MF boundary, không dùng được ở team-app.

### D4: `next-themes` cho theme toggle

**Quyết định:** Dùng `next-themes` (không phải custom implementation).

**Lý do:** `next-themes` xử lý: persist localStorage, sync across tabs, tránh flash on load bằng cách set class trước khi hydration. shadcn dùng CSS variables trên `:root` và `.dark` → `next-themes` toggle class `dark` trên `<html>` → shadcn variables tự apply. Không cần custom logic.

**Lưu ý:** `next-themes` không phụ thuộc vào Next.js framework — hoạt động với bất kỳ React app nào.

### D5: `packages/shared` structure

**Quyết định:**
```
packages/shared/
  package.json     name: "@ops/shared"
  tsconfig.json    extends @ops/shared-config/tsconfig.frontend.json
  src/
    types.ts       — Member, Role, Theme interfaces
    constants.ts   — shared constants (COOKIE_NAME, ROUTES, DEFAULT_THEME)
    store.ts       — Zustand store (useStore, GlobalState)
  index.ts         — re-export all
```

`GlobalState` shape:
```ts
interface GlobalState {
  user: Member | null
  isAuthenticated: boolean   // explicit boolean, không derive runtime từ user !== null
  isLoading: boolean         // true trong khi /api/auth/me đang pending
  theme: 'light' | 'dark'
  setUser: (user: Member | null) => void
  setAuthenticated: (v: boolean) => void
  setLoading: (v: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

**Lý do `isAuthenticated` explicit:** Tránh component phải tự derive `user !== null`. Rõ ràng hơn khi đọc code — `isAuthenticated` là intent, không phải consequence.

**Lý do `isLoading` trong store thay vì local state:** `AuthInitializer` (bên ngoài Router) set `isLoading`, `ProtectedRoute` (bên trong Router) đọc `isLoading` để render spinner. Hai component này không share parent → phải qua store.

**Lý do tách `types.ts` và `store.ts`:** Backend (NestJS) có thể import `@ops/shared/types` để dùng `Member` type mà không kéo Zustand vào — Zustand là browser-only bundle.

## Risks / Trade-offs

**[Risk] Team-app standalone mode mất store** → Khi chạy team-app port 3001 độc lập (không qua shell), `shell/store` không available → crash. Mitigation: Dùng fallback trong team-app: nếu import `shell/store` fail thì dùng local null state (skip hiển thị tên user, fallback về role viewer hoặc admin cho dev).

**[Risk] Cookie SameSite và dev proxy** → Shell dev server proxy `/api` → `localhost:4000`. Cookie set bởi API cần được trả về qua proxy. Mitigation: Rsbuild proxy config đã có `changeOrigin: true`. NestJS cần `cookie-parser` và response phải không set `domain` (để browser accept cookie từ localhost).

**[Risk] Zustand singleton bị duplicate nếu misconfigure MF** → Nếu `zustand` không được config `singleton: true` ở tất cả apps, mỗi app load instance riêng → store không sync. Mitigation: Verify `shared.zustand.singleton: true` trong tất cả `rsbuild.config.ts`.

**[Trade-off] Password trong Member entity** → Cần đảm bảo password hash không được trả về trong API responses. Mitigation: Dùng TypeORM `@Exclude()` decorator trên `password` field + `ClassSerializerInterceptor` globally, hoặc manually omit password trong DTO mapping.

## Migration Plan

1. **DB migration**: Chạy `migration:run` để thêm `password` column. Column `nullable: false` → cần default value hoặc chạy migration theo 2 bước (thêm nullable, sau đó backfill, rồi đổi thành non-nullable). Vì đây là dev environment với seed data, approach đơn giản: drop và recreate với `synchronize: false` + migration.

2. **Re-seed**: Sau migration, chạy `pnpm seed` để insert members với password đã hash.

3. **Deploy order**: API trước (migration + auth endpoints), sau đó shell (với login page), sau đó team-app (với role-based UI). Thứ tự này đảm bảo không có dependency lỗi.

4. **Rollback**: Tạo migration `RevertAddPasswordToMember` để drop column. Shell fallback: nếu `/api/auth/me` trả lỗi, redirect `/login` (behavior đã handle trong auth init).

## Open Questions

~~**Seed passwords**: Default password cho seeded members là gì?~~ → **Resolved:** `"password123"` cho mọi seeded member.

~~**Cookie expiry vs JWT expiry**: Cookie `maxAge` set bằng JWT expiry (7d) hay session cookie?~~ → **Resolved:** Set `maxAge: 7 * 24 * 60 * 60 * 1000` để match JWT expiry (7d).
