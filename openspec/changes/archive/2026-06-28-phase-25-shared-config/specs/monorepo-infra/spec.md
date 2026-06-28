## MODIFIED Requirements

### Requirement: Module Federation packages có mặt ở workspace root
Root `package.json` SHALL khai báo `@module-federation/rsbuild-plugin` và `@module-federation/enhanced` trong dependencies (hoặc devDependencies). Root `package.json` SHALL có `@biomejs/biome` trong devDependencies thay cho `eslint`, `prettier` và các plugins liên quan.

#### Scenario: MF packages được install
- **WHEN** chạy `pnpm install` tại monorepo root
- **THEN** cả hai packages xuất hiện trong `node_modules` tại root

#### Scenario: Biome được install tại root
- **WHEN** chạy `pnpm install` tại monorepo root
- **THEN** `@biomejs/biome` xuất hiện trong root `node_modules` và command `pnpm biome --version` chạy thành công

#### Scenario: ESLint và Prettier không còn trong root dependencies
- **WHEN** đọc root `package.json`
- **THEN** `eslint`, `prettier`, `eslint-plugin-prettier`, `prettier-plugin-tailwindcss`, `@typescript-eslint/*` không xuất hiện trong `dependencies` hoặc `devDependencies`

## ADDED Requirements

### Requirement: biome.json tại root quản lý lint và format toàn workspace
File `biome.json` SHALL tồn tại tại monorepo root và cấu hình Biome với `formatter.enabled: true`, `linter.enabled: true`, rules `recommended: true` cho JavaScript/TypeScript. File này là nguồn duy nhất cho lint và format config của toàn monorepo.

#### Scenario: biome.json tồn tại với đúng cấu trúc
- **WHEN** đọc `biome.json` tại monorepo root
- **THEN** file tồn tại với `$schema` trỏ đến Biome schema, có sections `formatter`, `linter`, và `javascript`

#### Scenario: Không còn ESLint config files trong monorepo
- **WHEN** tìm kiếm `.eslintrc*`, `eslint.config.*` trong toàn bộ monorepo (trừ node_modules)
- **THEN** không tìm thấy file nào

#### Scenario: Không còn Prettier config files trong monorepo
- **WHEN** tìm kiếm `.prettierrc*`, `prettier.config.*` trong toàn bộ monorepo (trừ node_modules)
- **THEN** không tìm thấy file nào

### Requirement: Root package.json scripts dùng Biome cho lint và format
Root `package.json` SHALL có scripts: `"lint": "biome lint ."`, `"format": "biome format --write ."`, `"check": "biome check --write ."`.

#### Scenario: pnpm lint chạy qua Biome
- **WHEN** chạy `pnpm lint` tại monorepo root
- **THEN** Biome lint được thực thi và exit code là 0 (không có lint errors)

#### Scenario: pnpm format chạy qua Biome
- **WHEN** chạy `pnpm format` tại monorepo root
- **THEN** Biome format được thực thi với `--write` flag và exit code là 0

### Requirement: turbo.json không còn propagate lint/format per-package
Turbo tasks `lint` và `format` SHALL không có `dependsOn: ["^lint"]` hoặc `dependsOn: ["^format"]` vì các commands này chạy ở root-level qua Biome, không per-package.

#### Scenario: turbo lint không trigger per-package lint scripts
- **WHEN** chạy `turbo lint`
- **THEN** chỉ root-level lint script được thực thi, không có lỗi "missing script" từ apps không có lint script riêng
