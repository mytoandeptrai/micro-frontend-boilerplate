## ADDED Requirements

### Requirement: Shell app có đầy đủ scaffold files
`apps/shell` SHALL chứa tối thiểu: `rsbuild.config.ts`, `src/index.tsx`, `src/bootstrap.tsx`, `src/App.tsx`, `package.json`, `tsconfig.json`.

#### Scenario: Scaffold files tồn tại
- **WHEN** liệt kê nội dung `apps/shell`
- **THEN** tất cả files bắt buộc phải tồn tại

### Requirement: Bootstrap pattern được áp dụng
`src/index.tsx` SHALL chỉ chứa một dynamic import: `import('./bootstrap')`. Toàn bộ app initialization SHALL nằm trong `src/bootstrap.tsx`.

#### Scenario: index.tsx chỉ có dynamic import
- **WHEN** đọc nội dung `src/index.tsx`
- **THEN** file chỉ chứa `import('./bootstrap')` (hoặc tương đương async import), không có React imports hay ReactDOM.render ở top level

#### Scenario: App render bình thường sau khi tách bootstrap
- **WHEN** truy cập `localhost:3000` sau khi chạy `pnpm dev` trong `apps/shell`
- **THEN** app render và không có lỗi trong console

### Requirement: Shell được config là Module Federation host
`rsbuild.config.ts` SHALL sử dụng `pluginModuleFederation` với `name: "shell"`, `remotes: {}`, và shared deps đúng chuẩn.

#### Scenario: MF host config hợp lệ
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build thành công không có lỗi Module Federation config

#### Scenario: Shared deps được config singleton
- **WHEN** đọc `rsbuild.config.ts`
- **THEN** `react` và `react-dom` có `singleton: true, eager: true`; `react-router-dom`, `@tanstack/react-query`, `zustand` có `singleton: true`

### Requirement: TailwindCSS v4 hoạt động trong shell
`apps/shell` SHALL có TailwindCSS v4 được cài đặt và extend từ `@ops/ui/tailwind.preset`.

#### Scenario: Tailwind classes áp dụng được trong components
- **WHEN** một component trong shell dùng Tailwind utility class (ví dụ: `className="flex items-center"`)
- **THEN** styles được áp dụng đúng khi render tại `localhost:3000`

### Requirement: React Router v6 setup với 4 routes
Shell SHALL config `BrowserRouter` với routes: `/` (Dashboard), `/team` (Team), `/monitor` (Monitor), `/settings` (Settings).

#### Scenario: Route / render được
- **WHEN** truy cập `localhost:3000/`
- **THEN** Dashboard placeholder content hiển thị không có lỗi routing

#### Scenario: Route /team render được
- **WHEN** truy cập `localhost:3000/team`
- **THEN** Team placeholder content hiển thị không có lỗi routing

#### Scenario: Route /monitor render được
- **WHEN** truy cập `localhost:3000/monitor`
- **THEN** Monitor placeholder content hiển thị không có lỗi routing

#### Scenario: Route /settings render được
- **WHEN** truy cập `localhost:3000/settings`
- **THEN** Settings placeholder content hiển thị không có lỗi routing

### Requirement: Header component render app title và user placeholder
`src/layout/Header.tsx` SHALL hiển thị app title "Ops Dashboard" và một user avatar/name placeholder.

#### Scenario: Header hiển thị đúng nội dung
- **WHEN** render `<Header />`
- **THEN** element có text "Ops Dashboard" xuất hiện trong DOM

### Requirement: Sidebar component render nav links và highlight active route
`src/layout/Sidebar.tsx` SHALL render navigation links tới `/`, `/team`, `/monitor`, `/settings` và highlight link của route hiện tại.

#### Scenario: Sidebar render đủ 4 nav links
- **WHEN** render `<Sidebar />` bên trong `BrowserRouter`
- **THEN** 4 navigation links tồn tại trong DOM

#### Scenario: Sidebar highlight active link
- **WHEN** current route là `/team`
- **THEN** nav link tới `/team` có active indicator (class hoặc aria-current)

#### Scenario: Sidebar links navigate đúng route
- **WHEN** click vào nav link `/monitor` trong Sidebar
- **THEN** URL thay đổi thành `/monitor` và Monitor page content hiển thị
