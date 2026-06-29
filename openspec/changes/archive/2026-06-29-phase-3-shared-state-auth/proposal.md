## Why

Phase 1 và 2 đã thiết lập monorepo infrastructure và team-app MFE với Member CRUD cơ bản, nhưng toàn bộ hệ thống chưa có auth — bất kỳ ai cũng truy cập được mọi route, và không có cách nào để các remote app biết user là ai hay có quyền gì. Phase 3 giải quyết điều này bằng cách thêm JWT auth (httpOnly cookie), global Zustand store cho user/theme state, và role-based UI permissions.

## What Changes

- **[packages/shared — MỚI]** Tạo package `@ops/shared` với Zustand global store (`user`, `isAuthenticated`, `isLoading`, `theme`), shared TypeScript types (`Member`, `Role`, `Theme`), và constants dùng chung toàn monorepo.
- **[apps/api]** Thêm `password` field vào `Member` entity + migration. Tạo `AuthModule` với endpoints `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. JWT được set vào httpOnly cookie để tránh XSS.
- **[apps/shell]** Thêm `AuthInitializer` (gọi `/api/auth/me` khi mount, set store), `GuestRoute` (redirect về `/` nếu đã auth — bảo vệ `/login`), `ProtectedRoute` (redirect về `/login` với `returnUrl` nếu chưa auth, handle `isLoading`). Route structure dùng `useRoutes` với layout-level protection. Theme toggle với `next-themes`. Expose `./store` qua Module Federation.
- **[apps/team-app]** Import store từ `shell/store` qua MF, hiển thị tên user, ẩn/hiện buttons (Create/Edit/Delete) theo role: `admin` > `member` > `viewer`.

## Capabilities

### New Capabilities

- `auth`: Đăng nhập/đăng xuất với JWT httpOnly cookie; bảo vệ routes; khôi phục session qua `/api/auth/me` khi refresh trang.
- `global-store`: Zustand singleton store exposed qua Module Federation — các remote app đọc user và theme mà không cần prop drilling hay event bus.
- `role-based-ui`: UI hiển thị/ẩn actions (Create/Edit/Delete Member) dựa theo role của user đang đăng nhập.
- `theme-toggle`: Dark/light theme toggle tại shell Header, persist qua localStorage, áp dụng cho toàn shell bằng CSS variables của shadcn.

### Modified Capabilities

- `shell-app`: Shell không còn render toàn bộ app ở mọi route — cần `GuestRoute` + `ProtectedRoute` + `AuthInitializer` + route structure mới (layout-level protection với `useRoutes`).

## Non-goals

- Không implement event bus (Phase 4)
- Không tạo monitor-app hay settings-app (Phase 4, 5)
- Không áp dụng `JwtAuthGuard` lên members endpoints (sẽ làm ở phase sau nếu cần)
- Không implement refresh token (out of scope)
- Không implement social login hay multi-factor auth

## Impact

**Packages mới:**
- `packages/shared` (`@ops/shared`) — cần thêm vào `pnpm-workspace.yaml` và được install ở shell + team-app

**Apps bị thay đổi:**
- `apps/api` — migration mới, dependencies mới (`@nestjs/jwt`, `passport-jwt`, `bcrypt`, `cookie-parser`), `AuthModule`
- `apps/shell` — login page, `GuestRoute`, `ProtectedRoute`, `AuthInitializer`, route structure refactor (useRoutes + layout-level), `bootstrap.tsx` thay đổi, `rsbuild.config.ts` expose thêm `./store`
- `apps/team-app` — import `shell/store` qua MF remote, role-based UI logic

**Breaking changes:**
- Member entity có thêm `password` field — cần migration và re-seed database
- Shell routing thay đổi: mọi route ngoài `/login` giờ cần auth → cần test lại MF integration
