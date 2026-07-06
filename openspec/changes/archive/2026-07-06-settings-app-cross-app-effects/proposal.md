## Why

Hiện tại Ops Dashboard chưa có nơi nào để chỉnh workspace-level settings (tên workspace, timezone, notification preferences). Theme hiện đang toggle cục bộ trong `Header.tsx` qua `next-themes`, không persist xuống backend, và không có cơ chế đồng bộ cross-app rõ ràng ngoài việc các MFE tình cờ share chung DOM. Phase 5 bổ sung `settings-app` (remote 3) làm nơi quản lý các settings này, đồng thời thiết lập pattern "cross-app effect" chuẩn: một remote publish domain event qua event bus, shell là nơi duy nhất sở hữu side-effect (gọi `next-themes`), tránh việc mỗi remote phải tự phụ thuộc `next-themes`.

## What Changes

- Thêm `packages/shared`: event `'theme:change': { theme: 'light' | 'dark' }` vào `AppEventMap`.
- **BREAKING**: Xóa `theme` và `setTheme` khỏi `GlobalState`/`store.ts` trong `@ops/shared` — `next-themes` trở thành single source of truth cho theme, Zustand không còn giữ theme nữa. Bất kỳ code nào đang đọc `useStore.use.theme()` hoặc gọi `setTheme` từ Zustand sẽ vỡ (hiện tại không có usage nào ngoài field definition, đã verify qua grep).
- Thêm `apps/api`: entity `Settings` (singleton — 1 record), migration, seed, `GET /api/v1/settings`, `PATCH /api/v1/settings` (upsert nếu chưa có record).
- Thêm `apps/settings-app` (remote 3, port 3003): 3 trang — General (workspace name, timezone), Notifications (inApp, memberJoinAlert), Theme (toggle + publish `theme:change` + PATCH persist).
- Cập nhật `apps/shell`:
  - Thêm `settingsApp` vào `remotes` trong `rsbuild.config.ts`.
  - `bootstrap.tsx`: subscribe `'theme:change'` → gọi `setTheme` từ `next-themes`; on init, `GET /api/v1/settings` → gọi `setTheme(settings.theme)` để áp theme đã persist.
  - `routes.tsx`: route `/settings` hiện đang render `SettingsPage` (placeholder tĩnh) → đổi thành lazy-load `settingsApp/App`. Sidebar đã có sẵn link `/settings`, không cần đổi.
  - **BREAKING**: `Header.tsx` bỏ nút toggle theme (không import `next-themes`/`useTheme` nữa). `settings-app` (`ThemeSettings`) trở thành nơi duy nhất đổi theme, tránh 2 nguồn sự thật khi theme giờ đã persist xuống DB.

## Capabilities

### New Capabilities
- `settings-app`: Remote app mới (port 3003) — 3 trang settings (General/Notifications/Theme), bootstrap pattern, MF expose `./App`, chạy được standalone.
- `workspace-settings`: Backend capability — `Settings` entity (singleton record), migration, seed, `GET`/`PATCH /api/v1/settings`.

### Modified Capabilities
- `global-store`: Xóa `theme`/`setTheme` khỏi `GlobalState`. `GlobalState` sau khi đổi chỉ còn `user`, `isAuthenticated`, `isLoading` và các setters tương ứng.
- `event-bus`: Thêm `'theme:change': { theme: 'light' | 'dark' }` vào `AppEventMap`.
- `theme-toggle`: Nút toggle chuyển từ `Header` (shell) sang `settings-app` — `Header` không còn UI đổi theme. Theme change được trigger qua event bus từ `settings-app`, shell là nơi duy nhất gọi `next-themes`. Theme value được persist ở backend (`Settings.theme`) thay vì chỉ localStorage — khi shell khởi động, `GET /api/v1/settings` là nguồn sự thật cho theme ban đầu, ghi đè giá trị `next-themes` đọc từ localStorage nếu khác.
- `shell-app`: Route `/settings` đổi từ static `SettingsPage` sang lazy-load remote `settingsApp/App`; `rsbuild.config.ts` thêm remote `settingsApp`; `bootstrap.tsx` thêm subscription cho `theme:change` và load initial theme từ API.

## Impact

- **Code**: `packages/shared/src/event-bus/index.ts`, `packages/shared/src/store.ts`, `apps/shell/rsbuild.config.ts`, `apps/shell/src/bootstrap.tsx`, `apps/shell/src/routes` (App.tsx routes array), `apps/shell/src/pages/SettingsPage.tsx` (sẽ không còn được route tới — có thể xóa hoặc để lại làm fallback, quyết định ở design.md).
- **API mới**: `apps/api` — module `settings` (entity, migration, seed, controller, service, DTO) theo pattern của module `members`/`activity`.
- **App mới**: `apps/settings-app` — scaffold hoàn toàn mới, theo đúng bootstrap pattern và MF config của `team-app`/`monitor-app`.
- **Dependencies**: Không thêm `next-themes` vào `settings-app` hay bất kỳ remote nào khác ngoài `shell` — tránh vấn đề React Context bị duplicate qua MF boundary khi một package không được share singleton (xem design.md).
