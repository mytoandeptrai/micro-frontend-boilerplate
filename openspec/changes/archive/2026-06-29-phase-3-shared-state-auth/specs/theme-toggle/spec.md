## ADDED Requirements

### Requirement: ThemeProvider wrap shell app
Shell `bootstrap.tsx` SHALL wrap app với `ThemeProvider` từ `next-themes` với `attribute="class"` (để toggle class `dark` trên `<html>`) và `defaultTheme="system"`.

#### Scenario: ThemeProvider present trong render tree
- **WHEN** render shell app
- **THEN** `ThemeProvider` là ancestor của mọi component trong app

### Requirement: Header có theme toggle button
`Header.tsx` SHALL có button để toggle giữa `light` và `dark` theme. Button SHALL hiển thị icon tương ứng với theme hiện tại (ví dụ: sun icon cho light, moon icon cho dark).

#### Scenario: Toggle button hiển thị trong Header
- **WHEN** render `<Header />`
- **THEN** có button/element với role hoặc aria-label liên quan đến theme toggle

#### Scenario: Click toggle đổi theme
- **WHEN** user click theme toggle button khi đang ở light mode
- **THEN** class `dark` được thêm vào `<html>` element, shadcn CSS variables chuyển sang dark values

#### Scenario: Click lại đổi về light
- **WHEN** user click theme toggle button khi đang ở dark mode
- **THEN** class `dark` bị remove khỏi `<html>` element

### Requirement: Theme persist qua page refresh
`next-themes` SHALL tự động lưu theme preference vào localStorage. Khi user refresh trang, theme trước đó SHALL được khôi phục.

#### Scenario: Theme persist sau refresh
- **WHEN** user chọn dark mode, sau đó refresh trang
- **THEN** dark mode vẫn active (class `dark` trên `<html>`, localStorage có theme value)

### Requirement: E2E verify theme persist
Playwright SHALL test: toggle theme → refresh → verify theme được khôi phục.

#### Scenario: E2E theme persistence
- **WHEN** Playwright toggle sang dark mode và reload page
- **THEN** page vẫn render với dark mode active sau reload
