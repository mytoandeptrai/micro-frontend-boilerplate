## 1. packages/shared — Event Bus + Store

- [x] 1.1 `packages/shared/src/event-bus/index.ts`: thêm `'theme:change': { theme: 'light' | 'dark' }` vào `AppEventMap`
- [x] 1.2 `packages/shared/src/store.ts`: xóa `theme`, `setTheme` khỏi `GlobalState` interface và khỏi implementation của `useBaseStore`
- [x] 1.3 Verify: `pnpm --filter @ops/shared build` không lỗi TypeScript; `publishEvent('theme:change', { theme: 'dark' })` type-check đúng; truy cập `useStore.getState().theme` gây lỗi compile

## 2. Backend — Settings Entity + Migration + Seed

- [x] 2.1 Tạo `apps/api/src/modules/settings/settings.entity.ts`: entity `Settings` với `id` (uuid PK), `workspaceName` (string), `timezone` (string), `theme` (enum `SettingsTheme` — `'light' | 'dark'`, default `'dark'`), `inAppNotifications` (boolean, default `true`), `memberJoinAlert` (boolean, default `true`), `updatedAt` (auto-update timestamp)
- [x] 2.2 Tạo migration `CreateSettingsTable` trong `apps/api/src/shared/database/migrations/` theo pattern của `CreateActivityAndStats` (raw SQL, tạo enum type + table)
- [x] 2.3 Tạo `apps/api/src/shared/database/seeds/settings.seed.ts`: upsert 1 record với `workspaceName: 'Ops Dashboard'`, `timezone: 'Asia/Ho_Chi_Minh'`, `theme: 'dark'`, `inAppNotifications: true`, `memberJoinAlert: true`
- [x] 2.4 Update `apps/api/src/shared/database/seeds/run-seed.ts`: gọi `seedSettings(dataSource)`
- [ ] 2.5 Verify: `pnpm migration:run` tạo bảng `settings`; `pnpm seed` tạo đúng 1 record với default values — **BLOCKED: cần Postgres đang chạy, xem ghi chú cuối phiên**

## 3. Backend — Settings Endpoints

- [x] 3.1 Tạo `apps/api/src/modules/settings/dto/update-settings.dto.ts`: tất cả field optional (`@IsOptional()`), validate đúng type/enum
- [x] 3.2 Tạo `apps/api/src/modules/settings/settings.service.ts`: `getSettings()` — tìm record đầu tiên, nếu không có thì tạo mới với default rồi trả về; `updateSettings(dto)` — get-or-create rồi `Object.assign` + save các field được gửi
- [x] 3.3 Tạo `apps/api/src/modules/settings/settings.controller.ts`: `GET /settings` → `getSettings()`; `PATCH /settings` → `updateSettings(dto)` (không auth guard)
- [x] 3.4 Tạo `apps/api/src/modules/settings/settings.module.ts`, register `SettingsModule` trong `AppModule`
- [ ] 3.5 Verify: `GET /api/v1/settings` trả về settings hiện tại; `PATCH /api/v1/settings` với `{ theme: 'light' }` chỉ update field đó, giữ nguyên field khác — **typecheck OK, cần Postgres để verify HTTP thực tế (xem ghi chú cuối phiên)**

## 4. Backend — Unit Tests

- [x] 4.1 Test `SettingsService.getSettings()`: trả về record hiện có; tự tạo default nếu bảng rỗng
- [x] 4.2 Test `SettingsService.updateSettings()`: partial update giữ nguyên field không gửi; tạo mới nếu chưa có record
- [x] 4.3 Verify: `jest --testPathPattern=settings` pass — 4/4 tests pass

## 5. Scaffold apps/settings-app (sync từ templates/remote)

- [x] 5.1 `cp -r templates/remote apps/settings-app` — KHÔNG tạo tay từng file. Không cần thêm entry vào `pnpm-workspace.yaml` (đã glob `apps/*`)
- [x] 5.2 Replace placeholder trong toàn bộ file vừa copy: `REPLACE_APP_NAME` → `settingsApp`, `REPLACE_APP_SLUG` → `settings-app`, `REPLACE_PORT` → `3003` (đã sửa thêm 2 chỗ template tự thay sai so với convention thực tế: `package.json` `"name"` phải là `@ops/settings-app` kebab-case chứ không phải `@ops/settingsApp`; `rsbuild.config.ts` `port` phải là number `3003` chứ không phải string, và `bootstrap.tsx` basename phải là `/settings` — khớp route mount trong shell — chứ không phải `/settings-app`)
- [x] 5.3 Tạo `apps/settings-app/public/index.html` (template không có sẵn file này) — copy nguyên `apps/team-app/public/index.html`, chỉ đổi `<title>` thành "Ops Settings"
- [x] 5.4 `package.json`: thêm dependency `@ops/shared: workspace:*` (template chỉ có `@ops/shared-utils`, `@ops/ui`), thêm `@hookform/resolvers`, `react-hook-form`, `zod` (copy đúng version từ `apps/team-app/package.json`) cho form pages
- [x] 5.5 `package.json`: thêm devDependencies theo đúng `apps/monitor-app/package.json` — `@ops/shared-config`, `jest`, `ts-jest`, `jest-environment-jsdom`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, `@types/jest`; thêm script `"test": "jest"` và `"start": "rsbuild preview --port 3003"`
- [x] 5.6 `tsconfig.json`: đổi `extends` thành `"@ops/shared-config/tsconfig.frontend.json"` (template hiện là config đứng riêng, lỗi thời so với `team-app`/`monitor-app`), giữ nguyên `paths` override và thêm `"@ops/shared": ["../../packages/shared/src/index.ts"]` vào `paths`
- [x] 5.7 Tạo `apps/settings-app/jest.config.ts` — copy từ `apps/team-app/jest.config.ts` (App.tsx của template vẫn dùng `NuqsAdapter` nên cần giữ nguyên `nuqs` mock trong `moduleNameMapper`), bỏ mapping `shell/store` (settings-app không dùng Zustand store), thêm mapping `"^@ops/shared$": "<rootDir>/../../packages/shared/src/index.ts"` (theo `monitor-app`). Cũng copy `src/__mocks__/{fileMock.ts,fileMock.d.ts,nuqs.ts,nuqs.d.ts}` từ `team-app` (bỏ `shellStore.ts`)
- [x] 5.8 Verify: `pnpm --filter @ops/settings-app dev` chạy được tại `localhost:3003` (HTTP 200, verified qua curl), `pnpm --filter @ops/settings-app typecheck` pass, `pnpm --filter @ops/settings-app test` chạy đúng config (0 test files hiện tại — expected, test case sẽ thêm ở nhóm 8-10)

## 6. Module Federation Config — settings-app + shell

- [x] 6.1 `apps/settings-app/rsbuild.config.ts` (đã sync từ template ở nhóm 5): verify `shared` chỉ gồm `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand` — tất cả `singleton: true`, KHÔNG `eager`, KHÔNG liệt kê `@ops/shared` (đúng convention `team-app`/`monitor-app`, xem design.md quyết định #2). Đã đổi `assetPrefix`/proxy target sang dùng `SETTINGS_APP_URL`/`API_URL` env var thay vì hardcode (khớp convention `team-app`/`monitor-app`, template gốc hardcode "auto"/"http://localhost:4000")
- [x] 6.2 Tạo `apps/settings-app/.env.example` + `.env.local`: `SHELL_URL=http://localhost:3000`, `SETTINGS_APP_URL=http://localhost:3003`, `API_URL=http://localhost:4000` (theo đúng format của `monitor-app`/`team-app`)
- [x] 6.3 `apps/shell/rsbuild.config.ts`: thêm `settingsApp: \`settingsApp@${SETTINGS_APP_URL}/mf-manifest.json\`` vào `remotes`
- [x] 6.4 Update `apps/shell/.env.example` và `.env.local`: thêm `SETTINGS_APP_URL=http://localhost:3003`
- [x] 6.5 Update `apps/shell/src/remotes.d.ts`: thêm `declare module "settingsApp/App" { const App: React.ComponentType; export default App }` theo đúng pattern của `teamApp/App`/`monitorApp/App` đã có
- [x] 6.6 Verify: `pnpm --filter @ops/shell build` thành công, `dist/mf-manifest.json` chứa `settingsApp` remote (verified qua grep)

## 7. settings-app — Bootstrap + Tailwind + TanStack Query Hooks

- [x] 7.1 Verify `src/bootstrap.tsx` (đã sync từ template ở nhóm 5) đã wrap `App` với `QueryClientProvider`; `src/App.tsx` đã import `./styles/globals.css` — không cần sửa gì thêm nếu sync đúng
- [x] 7.2 Tạo `src/hooks/useSettings.ts`: `useQuery` GET `/api/v1/settings` (cùng `src/types.ts` định nghĩa `Settings`/`UpdateSettingsPayload`)
- [x] 7.3 Tạo `src/hooks/useUpdateSettings.ts`: `useMutation` PATCH `/api/v1/settings`, toast success/error qua Sonner, invalidate `['settings']` query sau khi thành công
- [ ] 7.4 Verify: `pnpm --filter settings-app dev` chạy standalone tại `localhost:3003` không lỗi (typecheck pass); hooks fetch data từ API cần Postgres đang chạy + trang thật sự gọi hook (nhóm 8-10) — **BLOCKED một phần, xem ghi chú cuối phiên**

## 8. settings-app — GeneralSettings Page

- [x] 8.1 Tạo `src/pages/GeneralSettings.tsx`: form react-hook-form + shadcn `Form`, field `workspaceName` (`Input`), `timezone` (`Select` với options từ `Intl.supportedValuesOf('timeZone')`)
- [x] 8.2 Submit gọi `useUpdateSettings` với `{ workspaceName, timezone }`
- [x] 8.3 RTL test: submit form gọi mutation với đúng payload — 2/2 tests pass
- [ ] 8.4 Verify: đổi workspace name + timezone, save thành công, toast hiển thị — **cần Postgres + shell chạy để test thủ công trên browser, xem ghi chú cuối phiên**

## 9. settings-app — NotificationSettings Page

- [x] 9.1 Tạo `src/pages/NotificationSettings.tsx`: form với `Checkbox` (shadcn) cho `inAppNotifications`, `memberJoinAlert`
- [x] 9.2 Submit gọi `useUpdateSettings` với các field đã đổi
- [x] 9.3 RTL test: toggle checkbox và submit gọi mutation với đúng payload — pass sau khi thêm `jest.setup.ts` polyfill `ResizeObserver` (Radix `Checkbox` render hidden bubble `<input>` bên trong `<form>`, cần `ResizeObserver` mà jsdom không có sẵn — gap mới vì `team-app`/`monitor-app` chưa test Checkbox bao giờ)
- [ ] 9.4 Verify: toggle notifications, save thành công — **cần Postgres + shell chạy để test thủ công trên browser, xem ghi chú cuối phiên**

## 10. settings-app — ThemeSettings Page

- [x] 10.1 Tạo `src/pages/ThemeSettings.tsx`: 2 `Button` (Light/Dark), variant active theo `settings.theme` hiện tại (KHÔNG import `next-themes`)
- [x] 10.2 Khi click: gọi `publishEvent('theme:change', { theme })` từ `@ops/shared` VÀ gọi `useUpdateSettings` với `{ theme }`
- [x] 10.3 RTL test: click đổi theme gọi cả `publishEvent` (mock) và mutation với đúng payload
- [x] 10.4 Tạo `src/App.tsx`: tab layout (`NavLink` + `Outlet`) với 3 routes con — `index` (General), `notifications`, `theme`. Cũng bổ sung `src/jest.d.ts` (`import "@testing-library/jest-dom"`) bị thiếu sót ở nhóm 5 khi copy mock files — thiếu file này khiến `tsc --noEmit` không thấy global `@types/jest` dù jest chạy runtime vẫn pass (khác biệt giữa typecheck tĩnh và jest transform riêng)
- [ ] 10.5 Verify: đổi theme ở `/settings` → event được publish, PATCH được gọi — unit test đã pass; verify thủ công trên browser cần Postgres + shell chạy (xem ghi chú cuối phiên)

## 11. Shell — Subscribe theme:change + Load Initial Theme

- [x] 11.1 Tạo `apps/shell/src/components/ThemeSync.tsx`: subscribe `'theme:change'` qua `useEventSubscription` từ `@ops/shared` → gọi `setTheme(theme)` từ `next-themes`; mount trong `bootstrap.tsx` bên trong `ThemeProvider` + `QueryClientProvider`
- [x] 11.2 `ThemeSync` cũng gọi `useSettings()` (mới, `apps/shell/src/hooks/useSettings.ts` + `api/settings.ts`, theo pattern `useAuth.ts`/`api/auth.ts`) → `useEffect` áp `setTheme(settings.theme)` khi data load xong, ghi đè giá trị `next-themes` đọc từ localStorage
- [ ] 11.3 Verify: đổi theme ở `/settings` → Header, `/team`, `/monitor` đổi theo ngay; refresh page → theme load lại từ API, không bị reset — **cần Postgres + toàn bộ services chạy để verify trên browser, xem ghi chú cuối phiên**

## 12. Shell — Remove Header Toggle, Update Routes

- [x] 12.1 `apps/shell/src/layout/Header.tsx`: xóa button toggle theme, import `useTheme`/`Moon`/`Sun`, hàm `toggleTheme` — chỉ giữ user info + logout
- [x] 12.2 Cập nhật `apps/shell/src/layout/Header.test.tsx`: xóa mock `next-themes` và test case "renders theme toggle button"
- [x] 12.3 `apps/shell/src/App.tsx`: thêm `const SettingsApp = React.lazy(() => import("settingsApp/App"))`, đổi route `settings` → `settings/*` (wildcard, vì settings-app có nested routes /notifications /theme) trỏ tới `<SettingsApp />` thay vì `<SettingsPage />`
- [x] 12.4 Xóa `apps/shell/src/pages/SettingsPage.tsx` (placeholder không còn được reference — verify qua grep trước khi xóa)
- [x] 12.5 Verify: `pnpm --filter @ops/shell typecheck` + `test` (12/12 pass) + `build` đều thành công. Sidebar link `/settings` đã có sẵn, không cần đổi. Navigate thực tế trên browser cần Postgres + toàn bộ services chạy (xem ghi chú cuối phiên)

## 13. E2E Tests

- [x] 13.1 `apps/shell/e2e/settings.spec.ts`: đổi theme ở `/settings` → verify class `dark` trên `<html>` (theo pattern `login()` helper của `monitor.spec.ts`)
- [x] 13.2 `apps/shell/e2e/settings.spec.ts`: đổi theme ở `/settings` → navigate sang `/team` → verify team-app cũng hiển thị theme mới (cùng DOM, không cần reload)
- [x] 13.3 `apps/shell/e2e/settings.spec.ts`: đổi theme → reload page → verify theme được load lại từ `GET /api/v1/settings`, không bị reset
- [ ] 13.4 Verify: `pnpm test` (unit, không cần DB) đã pass toàn bộ trừ 1 test pre-existing không liên quan (`app.controller.spec.ts`, đã fail sẵn trước thay đổi này — verify bằng `git stash`). `pnpm test:e2e` **CHƯA chạy được** — cần Postgres sống + migration/seed + toàn bộ 5 services (shell/team-app/monitor-app/settings-app/api) chạy cùng lúc. Theo quyết định của người dùng, dừng lại ở code + unit test cho phần cần DB — xem "Việc còn lại" cuối `tasks.md`

## Việc còn lại (cần Postgres đang chạy)

Không có Postgres nào chạy cho project này trong phiên làm việc này (chỉ có container Postgres của 1 project khác, không dùng được). Toàn bộ code đã viết xong, typecheck/build/unit test đều pass (trừ 1 test pre-existing không liên quan). Các bước sau **chưa được verify thật** vì cần DB sống — người dùng cần tự chạy khi có Postgres:

1. `pnpm --filter @ops/api migration:run` — verify bảng `settings` được tạo đúng
2. `pnpm --filter @ops/api seed` — verify tạo đúng 1 record default
3. Chạy `pnpm --filter @ops/api dev` rồi `curl` thử `GET`/`PATCH /api/v1/settings` — verify response thật khớp DTO
4. Chạy đủ 5 services (`shell` :3000, `team-app` :3001, `monitor-app` :3002, `settings-app` :3003, `api` :4000) rồi tự tay: đổi theme ở `/settings/theme` → verify Header/`/team`/`/monitor` đổi theo ngay, refresh → theme load lại từ API
5. `pnpm --filter @ops/shell test:e2e` (chạy `apps/shell/e2e/settings.spec.ts`) — cần đủ 5 service trên đang chạy song song (Playwright config chỉ tự start `shell`, các app còn lại phải tự chạy tay, giống các e2e spec khác trong repo)
