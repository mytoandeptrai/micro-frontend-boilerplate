## 1. Monorepo Cleanup & Rename

- [x] 1.1 Update root `package.json`: đổi `name` thành `"ops-dashboard"`, thêm `@module-federation/rsbuild-plugin` và `@module-federation/enhanced` vào devDependencies
- [x] 1.2 Xóa toàn bộ thư mục `apps/web`
- [x] 1.3 Update `packages/ui/package.json`: đổi `name` từ `@workspace/ui` → `@ops/ui`
- [x] 1.4 Grep toàn bộ monorepo tìm `@workspace/ui`, update tất cả references sang `@ops/ui`
- [x] 1.5 Update `turbo.json`: đổi `outputs` trong pipeline `build` thành `["dist/**"]`
- [x] 1.6 Chạy `pnpm install` và verify không có lỗi

## 2. Testing Infra Setup

- [x] 2.1 Cài Jest dependencies tại root: `jest`, `ts-jest`, `@types/jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [x] 2.2 Tạo `jest.config.ts` tại monorepo root với ts-jest transform, `testEnvironment: "jsdom"`, `setupFilesAfterFramework` trỏ đến jest-dom
- [x] 2.3 Cài Playwright: `@playwright/test` tại root, chạy `pnpm exec playwright install chromium`
- [x] 2.4 Tạo `playwright.config.ts` tại monorepo root với `baseURL: "http://localhost:3000"`, webServer config trỏ đến `pnpm dev` trong `apps/shell`
- [x] 2.5 Thêm scripts vào root `package.json`: `"test": "jest"`, `"test:e2e": "playwright test"`
- [x] 2.6 Verify: `pnpm test` và `pnpm test:e2e` chạy được (không cần tests, chỉ cần không lỗi config)

## 3. Scaffold apps/shell

- [x] 3.1 Tạo `apps/shell/package.json` với name `@ops/shell`, dependencies: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`; devDependencies: `@rsbuild/core`, `@rsbuild/plugin-react`, TypeScript tooling
- [x] 3.2 Tạo `apps/shell/tsconfig.json` với strict mode, JSX react-jsx
- [x] 3.3 Tạo `apps/shell/src/index.tsx` chỉ chứa `import('./bootstrap')`
- [x] 3.4 Tạo `apps/shell/src/bootstrap.tsx` với ReactDOM.createRoot render và QueryClientProvider wrapper
- [x] 3.5 Tạo `apps/shell/src/App.tsx` với BrowserRouter và placeholder content
- [x] 3.6 Verify: `pnpm dev` trong `apps/shell` → shell chạy tại localhost:3000

## 4. Module Federation Config

- [x] 4.1 Tạo `apps/shell/rsbuild.config.ts` với `pluginModuleFederation`: `name: "shell"`, `remotes: {}`, shared deps config (react/react-dom: singleton+eager, các còn lại: singleton only)
- [x] 4.2 Verify: `pnpm build` trong `apps/shell` không có lỗi MF config
- [x] 4.3 Verify: shell vẫn render bình thường tại localhost:3000 sau khi thêm MF config

## 5. TailwindCSS v4 Setup

- [x] 5.1 Cài `tailwindcss` v4 và Rsbuild Tailwind plugin vào `apps/shell`
- [x] 5.2 Tạo `apps/shell/tailwind.config.ts` extend từ `@ops/ui/tailwind.preset`
- [x] 5.3 Import Tailwind CSS vào `apps/shell/src/bootstrap.tsx` (hoặc global CSS entry)
- [x] 5.4 Verify: thêm một Tailwind class vào App.tsx và kiểm tra style được áp dụng tại localhost:3000

## 6. React Router v6 & Layout

- [x] 6.1 Setup `BrowserRouter` + `Routes` trong `apps/shell/src/App.tsx` với 4 routes: `/`, `/team`, `/monitor`, `/settings`
- [x] 6.2 Tạo 4 placeholder page components: `src/pages/DashboardPage.tsx`, `TeamPage.tsx`, `MonitorPage.tsx`, `SettingsPage.tsx` — mỗi file chỉ cần render tên page
- [x] 6.3 Tạo `apps/shell/src/layout/Header.tsx` với app title "Ops Dashboard" và user placeholder (avatar + "User" text)
- [x] 6.4 Tạo `apps/shell/src/layout/Sidebar.tsx` với NavLink tới 4 routes, active class highlight dùng React Router `NavLink`
- [x] 6.5 Wrap các routes trong `App.tsx` bằng layout (Header + Sidebar + content area)
- [x] 6.6 Verify: navigate giữa 4 routes qua Sidebar không có lỗi, layout hiển thị đúng

## 7. Tests

- [x] 7.1 Tạo `apps/shell/src/layout/Header.test.tsx`: test "renders app title" verify text "Ops Dashboard" có trong DOM
- [x] 7.2 Tạo `apps/shell/src/layout/Sidebar.test.tsx`: test "renders 4 nav links" verify đủ 4 links; test "highlights active route" verify NavLink active state
- [x] 7.3 Chạy `pnpm test` → verify 2 test files pass
- [x] 7.4 Tạo `apps/shell/e2e/shell.spec.ts`: test "loads at localhost:3000" verify page load và layout visible; test "sidebar navigation" verify click từng link navigate đúng route
- [x] 7.5 Chạy `pnpm test:e2e` → verify Playwright tests pass
