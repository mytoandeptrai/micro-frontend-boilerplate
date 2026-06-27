## ADDED Requirements

### Requirement: team-app có đầy đủ scaffold files
`apps/team-app` SHALL chứa tối thiểu: `rsbuild.config.ts`, `src/index.tsx`, `src/bootstrap.tsx`, `src/App.tsx`, `package.json`, `tsconfig.json`.

#### Scenario: Scaffold files tồn tại
- **WHEN** liệt kê nội dung `apps/team-app`
- **THEN** tất cả files bắt buộc phải tồn tại

### Requirement: Bootstrap pattern được áp dụng trong team-app
`apps/team-app/src/index.tsx` SHALL chỉ chứa `import('./bootstrap')`. `src/bootstrap.tsx` SHALL wrap App với `QueryClientProvider` riêng (standalone mode). Khi shell load qua MF, shell's `QueryClientProvider` được dùng thay thế.

#### Scenario: index.tsx chỉ có dynamic import
- **WHEN** đọc `apps/team-app/src/index.tsx`
- **THEN** file chỉ chứa dynamic import `./bootstrap`, không có React imports hay ReactDOM calls ở top level

#### Scenario: team-app standalone hoạt động
- **WHEN** chạy `pnpm dev` trong `apps/team-app` và truy cập `localhost:3001`
- **THEN** app render thành công không có lỗi console

### Requirement: team-app được config là Module Federation remote
`apps/team-app/rsbuild.config.ts` SHALL có `pluginModuleFederation` với: `name: "teamApp"`, `filename: "remoteEntry.js"`, `exposes: { "./App": "./src/App" }`. Shared deps SHALL có `singleton: true` (KHÔNG có `eager: true`) cho: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`.

#### Scenario: remoteEntry.js được generate khi build
- **WHEN** chạy `pnpm build` trong `apps/team-app`
- **THEN** `dist/remoteEntry.js` tồn tại

#### Scenario: Shared deps không có eager
- **WHEN** đọc `apps/team-app/rsbuild.config.ts`
- **THEN** tất cả shared deps có `singleton: true` và KHÔNG có `eager: true`

### Requirement: Shell config team-app làm remote
`apps/shell/rsbuild.config.ts` SHALL có `teamApp: "http://localhost:3001/remoteEntry.js"` trong `remotes`. Shell shared deps cho `react` và `react-dom` SHALL có `eager: true` (shell là host, cần load React trước).

#### Scenario: Shell nhận diện teamApp remote
- **WHEN** đọc `apps/shell/rsbuild.config.ts`
- **THEN** `remotes` object có key `teamApp` với value `http://localhost:3001/remoteEntry.js`

#### Scenario: Shell build thành công với remote config
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build thành công, không có lỗi Module Federation config

### Requirement: Shell load team-app lúc runtime qua MF
Khi người dùng navigate tới `/team`, shell SHALL load `teamApp/App` từ `localhost:3001/remoteEntry.js` lúc runtime (lazy). React, react-router-dom, @tanstack/react-query, zustand SHALL chỉ load 1 lần (singleton negotiation).

#### Scenario: /team hiển thị team-app content
- **WHEN** shell đang chạy (port 3000) và team-app đang chạy (port 3001), navigate tới `localhost:3000/team`
- **THEN** MemberList từ team-app hiển thị, không có lỗi "Shared module not found" hay "Multiple instances"

#### Scenario: Shared deps singleton không bị duplicate
- **WHEN** mở Network tab và truy cập `localhost:3000/team`
- **THEN** `react.js` hoặc tương đương chỉ load 1 lần duy nhất

### Requirement: team-app có TailwindCSS v4 và @ops/ui hoạt động
`apps/team-app` SHALL cài TailwindCSS v4. SHALL import `@ops/ui/globals.css` trong CSS entry file (KHÔNG dùng tailwind.preset riêng). Components từ `@ops/ui` SHALL render đúng styles.

#### Scenario: Tailwind classes áp dụng được
- **WHEN** component trong team-app dùng Tailwind class `className="flex items-center"`
- **THEN** styles được áp dụng khi render tại `localhost:3001`

#### Scenario: shadcn components từ @ops/ui render đúng
- **WHEN** import và render `<Table>` từ `@ops/ui` trong team-app
- **THEN** component render với đúng styles, không có lỗi import
