# shared-config

## Purpose

Defines requirements for the `@ops/shared-config` package that provides shared TypeScript configuration files for all apps and packages in the monorepo.

## Requirements

### Requirement: Package @ops/shared-config tồn tại trong workspace
`packages/shared-config/package.json` SHALL khai báo `name: "@ops/shared-config"` và package phải được pnpm workspace resolve được.

#### Scenario: Package xuất hiện trong pnpm workspace
- **WHEN** chạy `pnpm list -r --depth 0` tại monorepo root
- **THEN** `@ops/shared-config` xuất hiện trong danh sách workspace packages

### Requirement: shared-config cung cấp tsconfig.base.json
`packages/shared-config/tsconfig.base.json` SHALL định nghĩa các TypeScript compiler options cơ bản áp dụng cho toàn bộ workspace: `strict: true`, `target: ES2022`, `moduleResolution: bundler`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`.

#### Scenario: tsconfig.base.json tồn tại với đúng settings
- **WHEN** đọc `packages/shared-config/tsconfig.base.json`
- **THEN** file tồn tại và có `compilerOptions.strict: true`, `compilerOptions.target: "ES2022"`, `compilerOptions.moduleResolution: "bundler"`

### Requirement: shared-config cung cấp tsconfig.frontend.json cho React apps
`packages/shared-config/tsconfig.frontend.json` SHALL extend từ `tsconfig.base.json` và bổ sung `jsx: react-jsx`, `lib: ["ES2022", "DOM", "DOM.Iterable"]` cho React frontend applications.

#### Scenario: tsconfig.frontend.json extend đúng base
- **WHEN** đọc `packages/shared-config/tsconfig.frontend.json`
- **THEN** field `extends` trỏ đến `./tsconfig.base.json` và `compilerOptions.jsx` là `"react-jsx"`

#### Scenario: Frontend apps resolve types với DOM lib
- **WHEN** `apps/shell/tsconfig.json` extend từ `@ops/shared-config/tsconfig.frontend.json`
- **THEN** `pnpm typecheck --filter=shell` pass không có lỗi DOM type resolution

### Requirement: shared-config cung cấp tsconfig.backend.json cho NestJS
`packages/shared-config/tsconfig.backend.json` SHALL extend từ `tsconfig.base.json` và bổ sung `experimentalDecorators: true`, `emitDecoratorMetadata: true`. File này KHÔNG bao gồm `lib: DOM`.

#### Scenario: tsconfig.backend.json extend đúng base với decorator support
- **WHEN** đọc `packages/shared-config/tsconfig.backend.json`
- **THEN** field `extends` trỏ đến `./tsconfig.base.json`, `compilerOptions.experimentalDecorators: true`, `compilerOptions.emitDecoratorMetadata: true`

#### Scenario: DOM types không leak vào backend
- **WHEN** đọc `packages/shared-config/tsconfig.backend.json`
- **THEN** `compilerOptions.lib` không chứa `"DOM"` hay `"DOM.Iterable"`

### Requirement: Tất cả frontend apps/packages extend từ tsconfig.frontend.json
`apps/shell`, `apps/team-app`, `packages/ui`, và `packages/shared-utils` SHALL có `tsconfig.json` extend từ `@ops/shared-config/tsconfig.frontend.json`. Các app-specific overrides (paths, include, exclude) được giữ lại.

#### Scenario: Shell tsconfig extend đúng shared-config
- **WHEN** đọc `apps/shell/tsconfig.json`
- **THEN** field `extends` là `"@ops/shared-config/tsconfig.frontend.json"`

#### Scenario: Team-app tsconfig extend đúng shared-config
- **WHEN** đọc `apps/team-app/tsconfig.json`
- **THEN** field `extends` là `"@ops/shared-config/tsconfig.frontend.json"`

#### Scenario: packages/ui tsconfig extend đúng shared-config
- **WHEN** đọc `packages/ui/tsconfig.json`
- **THEN** field `extends` là `"@ops/shared-config/tsconfig.frontend.json"`

### Requirement: Backend app extend từ tsconfig.backend.json
`apps/api/tsconfig.json` SHALL extend từ `@ops/shared-config/tsconfig.backend.json`. App-specific overrides (module, outDir, paths, và các strict flags tạm thời) được giữ lại trong tsconfig.json của api.

#### Scenario: API tsconfig extend đúng shared-config
- **WHEN** đọc `apps/api/tsconfig.json`
- **THEN** field `extends` là `"@ops/shared-config/tsconfig.backend.json"`

### Requirement: pnpm typecheck pass toàn workspace sau migration
Sau khi tất cả tsconfigs migrate xong, `pnpm typecheck` SHALL pass clean không có lỗi mới phát sinh từ config migration.

#### Scenario: Typecheck clean sau migration
- **WHEN** chạy `pnpm typecheck` tại monorepo root
- **THEN** exit code là 0, không có type errors liên quan đến tsconfig settings mới
