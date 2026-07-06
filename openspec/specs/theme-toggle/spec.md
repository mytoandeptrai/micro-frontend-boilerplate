# theme-toggle

## Purpose

TBD — defines requirements for light/dark theme toggling in the shell app, using next-themes for persistence and class-based dark mode activation compatible with shadcn/Tailwind CSS variables.

## Requirements

### Requirement: ThemeProvider wrap shell app
Shell `bootstrap.tsx` SHALL wrap app với `ThemeProvider` từ `next-themes` với `attribute="class"` (để toggle class `dark` trên `<html>`) và `defaultTheme="system"`.

#### Scenario: ThemeProvider present trong render tree
- **WHEN** render shell app
- **THEN** `ThemeProvider` là ancestor của mọi component trong app

### Requirement: Theme persist qua page refresh, ưu tiên giá trị từ backend
`next-themes` vẫn tự động lưu theme preference vào `localStorage`. Tuy nhiên khi shell khởi động, `GET /api/v1/settings` SHALL là nguồn sự thật cho theme ban đầu — giá trị `theme` từ API SHALL ghi đè giá trị `next-themes` đọc được từ `localStorage` nếu 2 giá trị khác nhau.

#### Scenario: Theme từ API ghi đè localStorage khi khởi động
- **WHEN** `localStorage` có theme `'light'` nhưng `GET /api/v1/settings` trả về `theme: 'dark'`
- **THEN** sau khi shell mount xong, class `dark` được áp dụng trên `<html>` (theo giá trị từ API, không phải localStorage)

#### Scenario: Theme persist sau refresh khi đổi qua settings-app
- **WHEN** user đổi theme thành `dark` ở `/settings` (đã PATCH thành công xuống DB), sau đó refresh trang
- **THEN** dark mode vẫn active sau khi `GET /api/v1/settings` load xong

### Requirement: E2E verify theme persist và cross-app đồng bộ
Playwright SHALL test: đổi theme ở `/settings` → verify `Header`/`team-app`/`monitor-app` đổi theme ngay lập tức (cùng DOM) → refresh page → verify theme được khôi phục từ API, không bị reset về giá trị cũ.

#### Scenario: E2E theme thay đổi cross-app
- **WHEN** Playwright đổi theme sang `dark` tại `/settings`
- **THEN** class `dark` xuất hiện trên `<html>` VÀ nội dung `/team`, `/monitor` cũng hiển thị dark mode styling (không cần reload)

#### Scenario: E2E theme persistence sau reload
- **WHEN** Playwright đổi theme sang `dark` tại `/settings` và reload page
- **THEN** page vẫn render với dark mode active sau reload, giá trị được load từ `GET /api/v1/settings`

### Requirement: Shell subscribe theme:change và áp dụng qua next-themes
`shell/bootstrap.tsx` (bên trong `ThemeProvider`) SHALL subscribe event `'theme:change'` qua `subscribeEvent`/`useEventSubscription` từ `@ops/shared`. Khi nhận event, SHALL gọi `setTheme(theme)` từ `next-themes`. Đây là nơi DUY NHẤT trong toàn hệ thống gọi `next-themes` `setTheme` để phản hồi cross-app event.

#### Scenario: Shell nhận theme:change từ settings-app và áp dụng
- **WHEN** `settings-app` gọi `publishEvent('theme:change', { theme: 'dark' })`
- **THEN** shell nhận event và gọi `setTheme('dark')`, class `dark` được thêm vào `<html>`

### Requirement: Shell load theme ban đầu từ GET /api/v1/settings khi khởi động
Shell SHALL gọi `GET /api/v1/settings` một lần khi app mount (song song hoặc ngay sau `AuthInitializer`), sau đó gọi `setTheme(settings.theme)` từ `next-themes` với giá trị nhận được.

#### Scenario: Shell áp dụng theme từ API khi mount
- **WHEN** shell mount và `GET /api/v1/settings` trả về `{ theme: 'dark', ... }`
- **THEN** `setTheme('dark')` được gọi, `<html>` có class `dark`
