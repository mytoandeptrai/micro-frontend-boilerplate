## MODIFIED Requirements

### Requirement: Shell được config là Module Federation host
`rsbuild.config.ts` SHALL sử dụng `pluginModuleFederation` với `name: "shell"`, `remotes: { teamApp: "http://localhost:3001/remoteEntry.js" }`, và shared deps đúng chuẩn.

#### Scenario: MF host config hợp lệ
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build thành công không có lỗi Module Federation config

#### Scenario: Shared deps được config singleton
- **WHEN** đọc `rsbuild.config.ts`
- **THEN** `react` và `react-dom` có `singleton: true, eager: true`; `react-router-dom`, `@tanstack/react-query`, `zustand` có `singleton: true`

#### Scenario: teamApp remote được khai báo
- **WHEN** đọc `rsbuild.config.ts`
- **THEN** `remotes` có key `teamApp` với value `http://localhost:3001/remoteEntry.js`

### Requirement: React Router v6 setup với routes bao gồm team routes
Shell SHALL config `BrowserRouter` với routes: `/` (Dashboard), `/team` (MemberList từ team-app remote, lazy), `/team/:id` (MemberDetail từ team-app remote, lazy), `/monitor` (Monitor placeholder), `/settings` (Settings placeholder). Remote routes SHALL được lazy load qua `React.lazy` và MF dynamic import.

#### Scenario: Route / render được
- **WHEN** truy cập `localhost:3000/`
- **THEN** Dashboard placeholder content hiển thị không có lỗi routing

#### Scenario: Route /team render MemberList từ remote
- **WHEN** truy cập `localhost:3000/team` với team-app đang chạy tại port 3001
- **THEN** MemberList component từ team-app hiển thị

#### Scenario: Route /team/:id render MemberDetail từ remote
- **WHEN** truy cập `localhost:3000/team/<valid-uuid>` với team-app đang chạy tại port 3001
- **THEN** MemberDetail component từ team-app hiển thị với thông tin member

#### Scenario: Route /monitor render được
- **WHEN** truy cập `localhost:3000/monitor`
- **THEN** Monitor placeholder content hiển thị không có lỗi routing

#### Scenario: Route /settings render được
- **WHEN** truy cập `localhost:3000/settings`
- **THEN** Settings placeholder content hiển thị không có lỗi routing
