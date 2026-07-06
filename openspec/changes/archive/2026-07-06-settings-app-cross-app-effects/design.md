## Context

`settings-app` là remote thứ 3 sau `team-app` (3001) và `monitor-app` (3002). Pattern MF, bootstrap, testing đã được thiết lập ổn định qua 2 remote trước — phase này chủ yếu tái dùng pattern đó, cộng thêm một pattern mới: **cross-app side-effect qua event bus**, khác với `member:added`/`member:removed` (chỉ để 2 remote đồng bộ data qua TanStack Query invalidation) ở chỗ `theme:change` trigger một side-effect thực sự (gọi `next-themes`) mà chỉ shell được phép thực hiện.

Route `/settings` và sidebar link đã tồn tại từ `shell-app` (trỏ tới `SettingsPage` placeholder tĩnh) — phase này thay nội dung route đó bằng remote thật, không cần thêm route hay sidebar link mới.

## Goals / Non-Goals

**Goals:**
- `settings-app` chạy độc lập tại `:3003` và qua MF tại `shell:3000/settings`.
- Đổi theme ở bất kỳ đâu trong hệ thống → mọi MFE đổi theo ngay lập tức, và theme persist qua reload.
- Zustand không còn giữ `theme` — `next-themes` là single source of truth duy nhất cho theme tại runtime.

**Non-Goals** (nhắc lại từ proposal, giữ nguyên):
- Không per-user settings, không email notification, không user profile settings, không auth guard cho `/api/settings`.
- Không giải quyết flash-of-wrong-theme (FOUC) khi theme từ API khác với localStorage — xem Risk.

## Decisions

### 1. `settings-app` KHÔNG phụ thuộc `next-themes`, chỉ publish event
`ThemeSettings.tsx` chỉ gọi `publishEvent('theme:change', { theme })` + `PATCH /api/v1/settings`, không import `next-themes`.

**Vì sao**: `next-themes` hiện chỉ là dependency của `shell` (không nằm trong `shared` singleton list của bất kỳ MF config nào). Nếu `settings-app` cũng import `next-themes`, mỗi app sẽ bundle bản copy riêng → `createContext()` trong `next-themes` sinh ra Context object khác nhau giữa 2 module instance → `useTheme()` trong `settings-app` sẽ KHÔNG đọc được `ThemeProvider` mà `shell/bootstrap.tsx` đã dựng, dù cả hai đang chạy chung 1 React tree tại runtime (đây là lỗi kinh điển khi dùng React Context qua MF boundary với package không singleton). Thêm `next-themes` vào `shared` singleton cho mọi remote là một lựa chọn, nhưng tốn thêm 1 shared dependency chỉ để giải quyết vấn đề mà event bus (native `window` CustomEvent, không phụ thuộc React Context) đã giải quyết sẵn — event bus rẻ hơn và đúng với rule kiến trúc hiện tại ("remote app không import trực tiếp từ remote khác, chỉ qua event-bus hoặc Zustand store").

**Alternative đã cân nhắc**: share `next-themes` như singleton, để `settings-app` gọi thẳng `useTheme().setTheme()`. Bị loại vì thêm complexity không cần thiết và lệch khỏi pattern event-bus đã chuẩn hoá cho cross-remote effect.

### 2. `settings-app` MF `shared` KHÔNG liệt kê `@ops/shared`, chỉ singleton `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`
Theo đúng convention hiện có của `team-app`/`monitor-app` (đã verify qua `rsbuild.config.ts` của cả 2) — `@ops/shared` là dependency bình thường (import qua workspace resolution), không nằm trong `shared` singleton block ở bất kỳ remote nào.

**Vì sao**: `publishEvent`/`subscribeEvent` dùng `window.dispatchEvent`/`addEventListener` — không cần cùng module instance để hoạt động đúng (khác với React Context hay Zustand store cần singleton). Chỉ riêng `zustand` (thư viện, không phải `@ops/shared`) mới cần singleton để `shell/store` (exposed qua MF) và các remote share đúng 1 store instance. `openspec/specs/event-bus/spec.md` hiện có yêu cầu "@ops/shared MUST được shared singleton" nhưng thực tế `team-app`/`monitor-app` không làm vậy và event bus vẫn hoạt động đúng — đây là spec drift có từ trước, ngoài phạm vi sửa của phase này; `settings-app` sẽ theo đúng convention THỰC TẾ đang chạy, không theo văn bản spec cũ.

### 3. Shell là nơi DUY NHẤT gọi `next-themes` setTheme
`shell/bootstrap.tsx` (nằm trong `ThemeProvider`) subscribe `theme:change` và gọi `setTheme`. Không đặt subscription này trong `team-app`/`monitor-app` vì chúng không cần biết về theme.

### 4. GET `/api/v1/settings` là nguồn sự thật khi shell khởi động, ghi đè localStorage
`AuthInitializer`-style component mới (hoặc mở rộng logic trong `bootstrap.tsx`) gọi `GET /api/v1/settings` một lần khi mount, sau đó gọi `setTheme(settings.theme)` bất kể `next-themes` đã đọc gì từ `localStorage`.

**Vì sao**: yêu cầu "refresh page → theme load lại từ API, không bị reset" nghĩa là DB phải thắng localStorage. Đây là SPA không SSR nên không thể tránh hoàn toàn 1 frame flash nếu 2 giá trị khác nhau — chấp nhận trade-off này (xem Risk).

### 5. `SettingsService.getSettings()` tự heal nếu thiếu record thay vì throw
Vì `Settings` là singleton (đúng 1 record), `getSettings()` sẽ `findOne` record đầu tiên; nếu không có (edge case: seed chưa chạy) thì tạo record mới với default values và trả về, thay vì `NotFoundException`. `updateSettings()` dùng cùng cơ chế get-or-create rồi `save` các field được gửi lên (partial).

**Vì sao**: khác với `Member` (nhiều record, cần `id` để tìm), `Settings` luôn phải trả về được một giá trị hợp lệ cho FE — không có "not found" state hợp lý ở tầng UI cho 1 singleton config.

### 6. Theme toggle UI dùng `Button` group, không thêm `Switch` component mới vào `@ops/ui`
`@ops/ui/components/` hiện có `checkbox`, `select`, `input`, `form`... nhưng KHÔNG có `switch`. `NotificationSettings` dùng `Checkbox` có sẵn. `ThemeSettings` dùng 2 `Button` (Light/Dark, variant `outline`/`default` theo theme hiện tại) thay vì thêm `shadcn/ui Switch` mới.

**Vì sao**: thêm 1 component mới vào package dùng chung chỉ để phục vụ 1 chỗ dùng duy nhất là over-engineering (vi phạm "no abstractions for single-use"). Button group tái dùng component đã có, đủ để thể hiện trạng thái toggle.

### 7. Xóa nút toggle theme khỏi `Header.tsx`
`settings-app` (`ThemeSettings.tsx`) trở thành nơi DUY NHẤT để đổi theme. `Header.tsx` bỏ button toggle, `useTheme` import, và hàm `toggleTheme` — chỉ còn hiển thị user info + logout.

**Vì sao**: nút toggle cũ gọi `next-themes` trực tiếp, không publish event, không PATCH persist. Sau phase này, shell load theme từ `GET /api/v1/settings` mỗi lần khởi động (decision #4) và ghi đè giá trị hiện tại — nếu vẫn giữ 2 nơi đổi theme (Header không persist + Settings có persist), đổi qua Header rồi refresh sẽ bị revert về giá trị DB cũ, gây confusing UX bug. Quyết định: một nguồn sự thật duy nhất cho theme (`settings-app`), tránh 2 UI cùng sở hữu 1 state nhưng khác hành vi persist.

### 8. Xóa `apps/shell/src/pages/SettingsPage.tsx`
File này là placeholder tĩnh, sau khi đổi route sẽ không còn được reference ở đâu. Route thay đổi là do task này gây ra → xóa theo nguyên tắc "dọn orphan do chính thay đổi của mình tạo ra".

### 9. Scaffold `settings-app` bằng cách sync `templates/remote`, không tạo tay từng file
`apps/settings-app` được tạo bằng `cp -r templates/remote apps/settings-app` + replace placeholder (`REPLACE_APP_NAME`/`REPLACE_APP_SLUG`/`REPLACE_PORT`), sau đó bổ sung phần mà template chưa có bằng cách copy từ `team-app`/`monitor-app`: `jest.config.ts` (template không có file này), test-related devDependencies + script `test`/`start` trong `package.json`, `tsconfig.json` đổi sang `extends: "@ops/shared-config/tsconfig.frontend.json"` (template hiện là bản đứng riêng, lỗi thời so với 2 remote kia), dependency `@ops/shared` (template chỉ có `@ops/shared-utils`/`@ops/ui`), và `public/index.html` (template không có, chỉ có `favicon.png`).

**Vì sao**: `templates/remote` là nguồn scaffold chuẩn cho MF/bootstrap/rsbuild config, nhưng chưa được cập nhật để bao gồm test infra (jest, `@ops/shared-config`) — 2 phần này chỉ tồn tại trong `team-app`/`monitor-app` vì được thêm sau ở phase 2.5. Tạo tay các phần config này (đặc biệt là jest) rất dễ sai lệch với setup đã chạy ổn định; mirror trực tiếp từ app đã có là an toàn hơn viết mới.

### 10. API path là `/api/v1/settings` (không phải `/api/settings`)
`apps/api` set `app.setGlobalPrefix(apiPrefix)` với default `api/v1` (xem `main.ts`). Toàn bộ endpoint hiện có (`/api/v1/activity`, `/api/v1/stats`...) theo prefix này — `settings` module đi theo cùng convention, khác với cách gọi tắt `"/api/settings"` trong đề bài gốc.

## Risks / Trade-offs

- **[Risk] FOUC 1 frame khi theme từ API khác localStorage.** `next-themes` resolve theme synchronous từ localStorage trước paint đầu tiên; gọi `setTheme` lại sau khi `GET /api/v1/settings` resolve (async) có thể gây 1 lần re-render đổi theme ngay sau khi trang đã render. → **Mitigation**: chấp nhận trong nội bộ ops dashboard (không phải public-facing), không cần SSR/cookie-based solution.
- **[Risk] Xóa `theme`/`setTheme` khỏi `GlobalState` là breaking change cho `global-store` spec.** → **Mitigation**: đã verify qua grep không có usage nào khác ngoài định nghĩa field trong `store.ts`; sau khi xóa toggle khỏi `Header.tsx` (decision #7), không còn nơi nào trong code đọc theme từ Zustand.
- **[Risk] Xóa toggle khỏi `Header.tsx` là thay đổi UX đã tồn tại (theme-toggle spec hiện có yêu cầu "Header có theme toggle button").** → **Mitigation**: cập nhật delta spec `theme-toggle` để phản ánh việc toggle chuyển sang `settings-app`; đây là quyết định có chủ đích để tránh 2 nguồn sự thật, đã xác nhận với người yêu cầu thay đổi.
