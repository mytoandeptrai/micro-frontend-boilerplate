## 1. Tạo packages/shared-config

- [x] 1.1 Tạo thư mục `packages/shared-config` và chạy `pnpm init` với `name: "@ops/shared-config"`
- [x] 1.2 Đảm bảo `packages/shared-config` được bao gồm trong `pnpm-workspace.yaml` (kiểm tra glob pattern `packages/*` đã cover chưa)
- [x] 1.3 Tạo `packages/shared-config/tsconfig.base.json` với `strict: true`, `target: "ES2022"`, `moduleResolution: "bundler"`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`
- [x] 1.4 Tạo `packages/shared-config/tsconfig.frontend.json` extend từ `./tsconfig.base.json`, thêm `jsx: "react-jsx"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- [x] 1.5 Tạo `packages/shared-config/tsconfig.backend.json` extend từ `./tsconfig.base.json`, thêm `experimentalDecorators: true`, `emitDecoratorMetadata: true` (không có DOM lib)

## 2. Migrate tsconfig của frontend apps/packages

- [x] 2.1 Thêm `"@ops/shared-config": "workspace:*"` vào `devDependencies` của `apps/shell/package.json`
- [x] 2.2 Update `apps/shell/tsconfig.json`: thêm `"extends": "@ops/shared-config/tsconfig.frontend.json"`, xóa các compilerOptions đã được cover bởi base (target, lib, moduleResolution, jsx, strict, skipLibCheck), giữ lại `noEmit`, `paths`, `include`, `exclude`
- [x] 2.3 Thêm `"@ops/shared-config": "workspace:*"` vào `devDependencies` của `apps/team-app/package.json`
- [x] 2.4 Update `apps/team-app/tsconfig.json`: extend từ `@ops/shared-config/tsconfig.frontend.json`, giữ lại `noEmit`, `paths`, `include`, `exclude`
- [x] 2.5 Thêm `"@ops/shared-config": "workspace:*"` vào `devDependencies` của `packages/ui/package.json`
- [x] 2.6 Update `packages/ui/tsconfig.json`: extend từ `@ops/shared-config/tsconfig.frontend.json`, giữ lại `noEmit`, `paths`, `include`; xóa `packages/ui/tsconfig.lint.json` (không còn cần thiết sau khi xóa ESLint)
- [x] 2.7 Thêm `"@ops/shared-config": "workspace:*"` vào `devDependencies` của `packages/shared-utils/package.json`
- [x] 2.8 Update `packages/shared-utils/tsconfig.json`: extend từ `@ops/shared-config/tsconfig.frontend.json`, giữ lại overrides cần thiết

## 3. Migrate tsconfig của backend app (api)

- [x] 3.1 Thêm `"@ops/shared-config": "workspace:*"` vào `devDependencies` của `apps/api/package.json`
- [x] 3.2 Update `apps/api/tsconfig.json`: thêm `"extends": "@ops/shared-config/tsconfig.backend.json"`, giữ lại overrides bắt buộc cho NestJS: `module: "commonjs"`, `outDir: "./dist"`, `baseUrl: "./"`, `paths: { "@/*": ["src/*"] }`, và các strict flags tạm tắt (`strictNullChecks: false`, `noImplicitAny: false`, `strictBindCallApply: false`)
- [x] 3.3 Xác nhận `apps/api/tsconfig.build.json` vẫn hoạt động đúng (nó extend từ `tsconfig.json` local — không cần thay đổi gì thêm)

## 4. Verify typecheck toàn workspace

- [x] 4.1 Chạy `pnpm install` để resolve workspace deps mới
- [x] 4.2 Chạy `pnpm typecheck` — fix bất kỳ lỗi nào phát sinh từ config migration (không phải từ logic code)

## 5. Cài Biome và tạo biome.json

- [x] 5.1 Chạy `pnpm add -D -w @biomejs/biome` để cài Biome tại workspace root
- [x] 5.2 Tạo `biome.json` tại root với config cơ bản: `formatter.enabled: true` (indent 2 spaces, LF), `linter.enabled: true` với `recommended: true`, `javascript.formatter` theo Prettier style (no semi, double quotes), ignore patterns cho `node_modules`, `dist`, `.turbo`
- [x] 5.3 Chạy `pnpm biome check .` để xem số lượng issues ban đầu — ghi nhận nhưng không fix ngay (mục tiêu là pass với `--no-errors-on-unmatched`)

## 6. Xóa ESLint và Prettier

- [x] 6.1 Xóa file `apps/api/eslint.config.mjs`
- [x] 6.2 Xóa file `packages/ui/eslint.config.js` và `packages/ui/eslint.config.ts`
- [x] 6.3 Xóa file `.prettierrc` tại root
- [x] 6.4 Xóa file `apps/api/.prettierrc`
- [x] 6.5 Xóa `eslint`, `prettier`, `prettier-plugin-tailwindcss`, `@typescript-eslint/*`, `eslint-plugin-*`, `eslint-config-*` khỏi root `package.json` devDependencies
- [x] 6.6 Xóa eslint/prettier packages khỏi `apps/api/package.json` (nếu có)
- [x] 6.7 Xóa eslint/prettier packages khỏi `packages/ui/package.json` (nếu có `@tanstack/eslint-config` và dependencies)

## 7. Update scripts và turbo pipeline

- [x] 7.1 Update root `package.json` scripts: `"lint": "biome lint ."`, `"format": "biome format --write ."`, `"check": "biome check --write ."`
- [x] 7.2 Update `turbo.json`: xóa `dependsOn: ["^lint"]` khỏi task `lint`, xóa `dependsOn: ["^format"]` khỏi task `format` (các tasks này chạy ở root, không per-package)

## 8. Verify toàn bộ workspace

- [x] 8.1 Chạy `pnpm install` — xác nhận không có lỗi unresolved dependencies
- [x] 8.2 Chạy `pnpm typecheck` — xác nhận pass clean
- [x] 8.3 Chạy `pnpm lint` — xác nhận Biome lint chạy không có lỗi
- [x] 8.4 Chạy `pnpm format` — xác nhận Biome format chạy và apply changes
- [x] 8.5 Chạy `pnpm dev` (shell + team-app) — xác nhận apps vẫn khởi động bình thường
