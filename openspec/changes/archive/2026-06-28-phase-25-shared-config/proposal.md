## Why

Hiện tại mỗi app trong monorepo tự maintain tsconfig riêng với nhiều settings trùng lặp (strict, moduleResolution, target...), dẫn đến drift config khi có app mới được thêm vào. Ngoài ra việc dùng ESLint + Prettier tạo ra overhead cấu hình lớn (nhiều plugin, config files rải rác) và chạy chậm — Biome là lựa chọn thay thế nhanh hơn và đơn giản hơn cho cả lint lẫn format trong TypeScript/React codebase.

## What Changes

- **Tạo mới** `packages/shared-config` (@ops/shared-config) chứa 3 tsconfig base files:
  - `tsconfig.base.json` — strict mode, ES2022, moduleResolution: bundler
  - `tsconfig.frontend.json` — extend base, thêm JSX + DOM lib (cho React apps)
  - `tsconfig.backend.json` — extend base, thêm decorator support (cho NestJS), không có DOM
- **Migrate** tsconfig của tất cả apps/packages để extend từ @ops/shared-config thay vì tự define settings cơ bản:
  - `apps/shell`, `apps/team-app`, `packages/ui` → extend tsconfig.frontend.json
  - `apps/api` → extend tsconfig.backend.json
- **Cài Biome** tại workspace root, tạo `biome.json` với rules cơ bản cho TypeScript/React
- **Xóa ESLint + Prettier** và toàn bộ config files liên quan (`.eslintrc*`, `.prettierrc*`, plugins) khỏi toàn bộ monorepo
- **Update scripts** trong root `package.json`: `lint`, `format`, `check` chạy qua Biome
- **Update `turbo.json`**: task `lint` và `format` chạy ở root-level qua Biome (không còn per-package)

**Non-goals:**
- Không move Jest config vào shared-config — giữ nguyên tại root
- Không thay đổi logic code của bất kỳ app nào
- Không enable Biome rules strict/opinionated trong lần đầu — chỉ setup rules cơ bản trước
- Không thêm Biome vào CI pipeline trong phase này (chỉ local tooling)

## Capabilities

### New Capabilities

- `shared-config`: Package @ops/shared-config cung cấp tsconfig base files được share across toàn bộ workspace, loại bỏ duplication và đảm bảo consistency về TypeScript settings.

### Modified Capabilities

- `monorepo-infra`: Tooling layer của monorepo thay đổi — thêm @ops/shared-config package vào workspace, thay thế ESLint/Prettier bằng Biome, cập nhật turbo pipeline cho lint/format.

## Impact

**Packages/apps bị ảnh hưởng:**
- `packages/shared-config` — tạo mới
- `apps/shell` — tsconfig.json, package.json (xóa eslint deps)
- `apps/team-app` — tsconfig.json, package.json (xóa eslint deps)
- `apps/api` — tsconfig.json, package.json (xóa eslint deps)
- `packages/ui` — tsconfig.json, package.json (xóa eslint deps)
- `/` (root) — package.json (scripts + biome dep), turbo.json, biome.json (new), xóa .eslintrc/.prettierrc

**Dependencies thay đổi:**
- Thêm: `@biomejs/biome` (devDep tại root)
- Thêm: `@ops/shared-config` (workspace dep tại mỗi app)
- Xóa: `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-config-*` và các plugins liên quan khỏi tất cả package.json

**Build pipeline:**
- `pnpm typecheck` tiếp tục chạy per-package qua turbo
- `pnpm lint` và `pnpm format` chuyển sang root-level command qua Biome — không còn per-package lint scripts
