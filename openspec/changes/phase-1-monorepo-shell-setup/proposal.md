## Why

Project đang ở trạng thái scaffold ban đầu với tên `micro-frontend` và một `apps/web` placeholder chưa dùng. Để bắt đầu xây dựng Ops Dashboard theo kiến trúc micro-frontend thực sự, cần thiết lập đúng monorepo infra (rename, cleanup) và tạo shell app — host đầu tiên điều phối toàn bộ routing và shared providers — trước khi thêm bất kỳ remote app nào.

## What Changes

- **Rename** project root từ `micro-frontend` → `ops-dashboard` trong `package.json`
- **Xóa** `apps/web` — placeholder không cần thiết
- **Rename** `packages/ui` scope từ `@workspace/ui` → `@ops/ui` để khớp naming convention của project
- **Tạo mới** `apps/shell` — React + TypeScript, build bằng Rsbuild, config là Module Federation host
- **Cài đặt** `@module-federation/rsbuild-plugin` và `@module-federation/enhanced` vào workspace root
- **Update** `turbo.json` để output path khớp với Rsbuild (`dist/**` thay vì `.output/**`)
- **Setup** testing infra: Jest + ts-jest cho unit/component tests, Playwright cho E2E
- **Implement** bootstrap pattern trong `apps/shell` (index.tsx → dynamic import bootstrap.tsx)
- **Config** Module Federation host trong shell với `remotes: {}` trống và shared deps singleton
- **Setup** TailwindCSS v4 trong shell, extend từ `@ops/ui/tailwind.preset`
- **Setup** React Router v6 với routes: `/`, `/team`, `/monitor`, `/settings` (placeholder pages)
- **Tạo** layout components: `Header` và `Sidebar` với nav links

## Capabilities

### New Capabilities

- `monorepo-infra`: Cấu trúc monorepo đúng chuẩn — rename project, xóa placeholder app, rename @ops/ui, cài MF packages, update turbo config
- `shell-app`: Shell host app chạy tại localhost:3000 với MF config, Tailwind, React Router v6, layout hoàn chỉnh
- `testing-infra`: Jest + ts-jest config cho unit/RTL tests, Playwright config cho E2E — chạy được từ monorepo root

### Modified Capabilities

*(Không có — đây là Phase 1, chưa có specs nào tồn tại trước)*

## Impact

**Apps:**
- `apps/web` — bị xóa hoàn toàn
- `apps/shell` — tạo mới từ đầu

**Packages:**
- `packages/ui` — rename scope: `@workspace/ui` → `@ops/ui`

**Root:**
- `package.json` — rename project name, thêm MF dependencies
- `turbo.json` — update output paths
- Thêm Jest config, Playwright config tại monorepo root

**Non-goals:**
- Không setup Module Federation remotes (Phase 2)
- Không implement Zustand store hay event bus (Phase 3)
- Không build API endpoints
- Không tạo `packages/shared`
- Không implement real content cho các placeholder routes
