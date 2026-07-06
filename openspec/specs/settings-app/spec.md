# settings-app

## Purpose

Defines requirements for the settings Module Federation remote (`apps/settings-app`), including standalone scaffold, MF host config, and the General/Notification/Theme settings pages served under the shell's `/settings` route.

## Requirements

### Requirement: Settings App chạy standalone tại localhost:3003
`apps/settings-app` SHALL chạy độc lập tại port 3003 với đầy đủ Tailwind + `@ops/ui`. Bootstrap pattern MUST được áp dụng (`index.tsx` chỉ dynamic import `./bootstrap`).

#### Scenario: Standalone mode không lỗi
- **WHEN** developer chạy `pnpm --filter settings-app dev`
- **THEN** app load tại `localhost:3003` không có console error liên quan MF

### Requirement: Settings App được config là Module Federation remote
`rsbuild.config.ts` SHALL dùng `pluginModuleFederation` với `name: "settingsApp"`, `filename: "remoteEntry.js"`, `exposes: { './App': './src/App' }`. `shared` SHALL chỉ chứa `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand` với `singleton: true` (không `eager`), theo đúng convention của `team-app`/`monitor-app`.

#### Scenario: Build MF config hợp lệ
- **WHEN** chạy `pnpm build` trong `apps/settings-app`
- **THEN** build thành công, `remoteEntry.js` chứa exposed `./App`

### Requirement: GeneralSettings page cho phép sửa workspace name và timezone
`src/pages/GeneralSettings.tsx` SHALL hiển thị form với field `workspaceName` (Input) và `timezone` (Select, options lấy từ `Intl.supportedValuesOf('timeZone')`). Giá trị khởi tạo từ `GET /api/v1/settings`. Submit SHALL gọi `PATCH /api/v1/settings` với `{ workspaceName, timezone }` và hiển thị toast success/error qua Sonner.

#### Scenario: Load giá trị hiện tại vào form
- **WHEN** `GeneralSettings` mount và `GET /api/v1/settings` trả về data
- **THEN** input `workspaceName` và select `timezone` hiển thị đúng giá trị hiện tại

#### Scenario: Submit thành công hiển thị toast
- **WHEN** user sửa `workspaceName` và submit form
- **THEN** `PATCH /api/v1/settings` được gọi với `workspaceName` mới, toast success hiển thị

#### Scenario: Submit lỗi hiển thị toast error
- **WHEN** `PATCH /api/v1/settings` trả về lỗi
- **THEN** toast error hiển thị, form giữ nguyên giá trị user vừa nhập

### Requirement: NotificationSettings page cho phép toggle notification preferences
`src/pages/NotificationSettings.tsx` SHALL hiển thị 2 `Checkbox` (shadcn): `inAppNotifications`, `memberJoinAlert`. Submit SHALL gọi `PATCH /api/v1/settings` với các field đã đổi và hiển thị toast success/error.

#### Scenario: Toggle checkbox và submit
- **WHEN** user uncheck `memberJoinAlert` và submit form
- **THEN** `PATCH /api/v1/settings` được gọi với `{ memberJoinAlert: false }`, toast success hiển thị

### Requirement: ThemeSettings page publish theme:change và persist qua API
`src/pages/ThemeSettings.tsx` SHALL hiển thị toggle (Button group Light/Dark, không dùng `next-themes`). Khi user đổi theme: (1) gọi `publishEvent('theme:change', { theme })` từ `@ops/shared`, (2) gọi `PATCH /api/v1/settings` với `{ theme }`. `ThemeSettings.tsx` KHÔNG import `next-themes`.

#### Scenario: Đổi theme publish event và persist
- **WHEN** user click nút "Dark" trong `ThemeSettings` khi đang ở light mode
- **THEN** `publishEvent('theme:change', { theme: 'dark' })` được gọi VÀ `PATCH /api/v1/settings` được gọi với `{ theme: 'dark' }`

#### Scenario: Không phụ thuộc next-themes
- **WHEN** kiểm tra `package.json` và imports của `apps/settings-app`
- **THEN** `next-themes` KHÔNG xuất hiện trong dependencies hay bất kỳ file source nào
