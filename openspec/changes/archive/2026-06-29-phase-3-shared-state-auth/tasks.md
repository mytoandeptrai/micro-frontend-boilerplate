## 1. packages/shared — Tạo @ops/shared package

- [x] 1.1 Tạo `packages/shared/` với `package.json` (name: `@ops/shared`), `tsconfig.json` extending `@ops/shared-config/tsconfig.frontend.json`
- [x] 1.2 Tạo `src/types.ts` — `Member`, `Role` enum (`admin | member | viewer`), `Theme` type (`'light' | 'dark'`)
- [x] 1.3 Tạo `src/constants.ts` — shared constants (e.g. `COOKIE_NAME = 'ops_token'`, `DEFAULT_THEME`, `ROUTES`)
- [x] 1.4 Tạo `src/store.ts` — Zustand store với `GlobalState`: `user`, `isAuthenticated`, `isLoading`, `theme`, `setUser`, `setAuthenticated`, `setLoading`, `setTheme`
- [x] 1.5 Tạo `src/index.ts` — re-export tất cả từ `types`, `constants`, `store`
- [x] 1.6 Thêm `packages/shared` vào `pnpm-workspace.yaml` (nếu chưa có wildcard `packages/*`)
- [x] 1.7 Install `@ops/shared` vào `apps/shell` và `apps/team-app` (`pnpm --filter apps/shell add @ops/shared`)

## 2. apps/shell — ThemeProvider setup

- [x] 2.1 Install `next-themes` vào `apps/shell`
- [x] 2.2 Wrap app trong `bootstrap.tsx` với `<ThemeProvider attribute="class" defaultTheme="system">` từ `next-themes`

## 3. apps/api — Password field + Migration

- [x] 3.1 Thêm `@Column({ select: false }) password: string` vào `member.entity.ts` (dùng `select: false` để TypeORM không select password mặc định)
- [x] 3.2 Tạo migration `AddPasswordToMember`: `ALTER TABLE members ADD COLUMN password varchar NOT NULL DEFAULT ''`
- [x] 3.3 Cập nhật seed script: hash `"password123"` bằng `bcrypt.hashSync` trước khi insert mỗi member
- [ ] 3.4 Verify: chạy `pnpm migration:run && pnpm seed`, kiểm tra database có password column với hashed values

## 4. apps/api — JWT + Auth dependencies

- [x] 4.1 Install `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `cookie-parser` và types tương ứng
- [x] 4.2 Thêm `JWT_SECRET` vào `.env` và `config/` (validation schema), `JWT_EXPIRES_IN=7d`
- [x] 4.3 Config `cookie-parser` middleware trong `main.ts`

## 5. apps/api — Auth module

- [x] 5.1 Tạo `src/modules/auth/auth.module.ts` — import `JwtModule.register({ secret, signOptions: { expiresIn: '7d' } })`, `MembersModule`
- [x] 5.2 Tạo `src/modules/auth/auth.service.ts` — `login(email, password)` verify bcrypt + tạo JWT; `getMe(userId)` return member
- [x] 5.3 Tạo `src/modules/auth/jwt.strategy.ts` — `PassportStrategy(Strategy)` đọc JWT từ cookie `ops_token`
- [x] 5.4 Tạo `src/modules/auth/jwt-auth.guard.ts` — `AuthGuard('jwt')` wrapper
- [x] 5.5 Tạo `src/modules/auth/auth.controller.ts` — `POST /auth/login` (set httpOnly cookie `maxAge: 7d`, return member), `GET /auth/me` (JwtAuthGuard, return member), `POST /auth/logout` (clear cookie `maxAge: 0`)
- [x] 5.6 Register `AuthModule` trong `app.module.ts`
- [ ] 5.7 Verify: `POST /api/auth/login` với seeded credentials → response có `Set-Cookie` header; `GET /api/auth/me` với cookie → return member

## 6. apps/api — Auth unit tests

- [x] 6.1 Tạo `src/modules/auth/auth.service.spec.ts` — test `login` đúng credentials, `login` sai password (expect UnauthorizedException), `login` email không tồn tại, `getMe` valid userId
- [x] 6.2 Verify: `jest --testPathPattern=auth` pass, không có failures

## 7. apps/shell — Module Federation expose store

- [x] 7.1 Thêm `exposes: { './store': '@ops/shared/store' }` vào `pluginModuleFederation` config trong `rsbuild.config.ts`
- [x] 7.2 Thêm `@ops/shared` vào `shared` section nếu cần (hoặc bundle trực tiếp qua expose)
- [x] 7.3 Verify: `pnpm build` trong `apps/shell` thành công, `remoteEntry.js` tồn tại

## 8. apps/shell — Login page

- [x] 8.1 Tạo `src/pages/Login.tsx` — form với `email` và `password` inputs, submit button
- [x] 8.2 Submit handler: `POST /api/auth/login` → khi 200: `setUser(member)`, `setAuthenticated(true)`, navigate về `location.state.returnUrl ?? '/'`; khi 401: hiển thị error message
- [ ] 8.3 Tạo RTL test cho Login form: submit đúng credentials mock 200 → navigate về returnUrl; submit sai → hiển thị error

## 9. apps/shell — AuthInitializer, GuestRoute, ProtectedRoute, route structure

- [x] 9.1 Tạo `src/components/AuthInitializer.tsx` — gọi `GET /api/auth/me` khi mount: `setLoading(true)` trước, sau đó `setUser` + `setAuthenticated` + `setLoading(false)`. Không dùng router hooks. Wrap app trong `bootstrap.tsx` bên ngoài `<BrowserRouter>`.
- [x] 9.2 Tạo `src/components/ProtectedRoute.tsx` — đọc `isLoading` + `isAuthenticated` từ store. Render: loading → spinner; !isAuthenticated → `<Navigate to="/login" state={{ returnUrl: location.pathname }} replace />`; authenticated → children
- [x] 9.3 Tạo `src/components/GuestRoute.tsx` — đọc `isAuthenticated` từ store. Nếu `isAuthenticated` → `<Navigate to="/" replace />`; ngược lại → children
- [x] 9.4 Refactor `App.tsx` dùng `useRoutes` với layout-level protection: guest group (`GuestRoute` wrap `AuthLayout` với `/login`), protected group (`ProtectedRoute` wrap `AppLayout` với `/`, `/team`, `/monitor`, `/settings`), catch-all redirect `/`
- [x] 9.5 Tạo RTL tests: `ProtectedRoute` với isLoading=true → spinner; isAuthenticated=false → redirect với returnUrl; isAuthenticated=true → children. `GuestRoute` với isAuthenticated=true → redirect /; false → children

## 10. apps/shell — Theme toggle trong Header

- [x] 10.1 Cập nhật `Header.tsx`: thêm theme toggle button dùng `useTheme()` từ `next-themes`, sun/moon icon từ lucide-react hoặc `@ops/ui`
- [x] 10.2 Hiển thị `user.name` từ Zustand store trong Header
- [x] 10.3 Thêm Logout button: gọi `POST /api/auth/logout` → `setUser(null)`, `setAuthenticated(false)` → navigate `/login`
- [x] 10.4 Tạo RTL test cho Header: verify theme toggle button present, verify logout button gọi đúng API và clear store

## 11. apps/team-app — Role-based UI

- [x] 11.1 Thêm `declarations.d.ts` (nếu chưa có) để declare module `'shell/store'` với type `{ useStore: ... }`
- [x] 11.2 Import `useStore` từ `'shell/store'` trong MemberList component, đọc `user.role`
- [x] 11.3 Ẩn Create Member button nếu role không phải `admin`
- [x] 11.4 Ẩn Delete button nếu role là `viewer`
- [x] 11.5 Ẩn Edit button nếu role là `viewer`
- [x] 11.6 Tạo RTL tests cho MemberList: mock store với 3 role khác nhau, assert visibility của Create/Edit/Delete buttons

## 12. E2E Tests (Playwright)

- [x] 12.1 Tạo `e2e/auth.spec.ts` — test login flow: fill form → submit → redirect dashboard
- [x] 12.2 Test returnUrl: truy cập `/team` khi chưa login → redirect `/login` → login → redirect về `/team`
- [x] 12.3 Test logout: click logout → redirect `/login`, cookie cleared
- [x] 12.4 Test GuestRoute: login xong, navigate tới `/login` → redirect về `/`
- [x] 12.5 Test unauthenticated redirect: truy cập `/team` khi chưa login → redirect `/login`
- [x] 12.6 Test theme persist: toggle dark → reload → verify dark mode active (html class + localStorage)
- [x] 12.7 Test role viewer: login với viewer account → navigate `/team` → assert Delete button không tồn tại
- [x] 12.8 Test role admin: login với admin account → navigate `/team` → assert Create + Delete buttons visible
- [ ] 12.9 Verify: `pnpm test:e2e` pass (tất cả Playwright tests) — cần services đang chạy
