## Context

Monorepo hiện tại có 5 apps (shell, team-app, api + 2 remote apps chưa tạo) và 2 packages (ui, shared-utils). Mỗi app tự define tsconfig riêng với các settings cơ bản trùng lặp (target, moduleResolution, strict, skipLibCheck). Tooling lint/format hiện tại:

- **Prettier**: config tại root `.prettierrc`, có `prettier-plugin-tailwindcss`
- **ESLint**: chỉ có `apps/api` và `packages/ui` có config (ESLint flat config). Phần lớn apps frontend chưa có ESLint config.
- `turbo.json` có tasks `lint` và `format` nhưng hầu hết apps không có scripts tương ứng → tasks này gần như no-op hiện tại.

**Vấn đề cụ thể của `apps/api` tsconfig**: api đang dùng `strict: false` implicitly (tắt `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`), module là `commonjs`, target là `ES2021`. Đây là NestJS default — khác hoàn toàn với frontend apps.

## Goals / Non-Goals

**Goals:**
- Tạo `packages/shared-config` với 3 tsconfig base files share được qua toàn workspace
- Mỗi app chỉ giữ lại overrides cần thiết (paths, include/exclude, các compiler options app-specific)
- Thay Biome cho ESLint + Prettier — chạy 1 lần ở root thay vì per-package
- `pnpm typecheck`, `pnpm lint`, `pnpm format` đều pass clean sau migration

**Non-Goals:**
- Không fix type errors phát sinh từ strict mode mới (nếu có, giữ override để tắt)
- Không config Biome rules ngoài essential set ban đầu
- Không migrate Jest config hay Playwright config
- Không thêm Biome vào CI trong phase này

## Decisions

### D1: Tạo `packages/shared-config` thay vì đặt tsconfig ở root

**Lựa chọn:** Package riêng biệt với `name: "@ops/shared-config"` trong pnpm workspace.

**Lý do:** Apps extend tsconfig qua `"extends": "@ops/shared-config/tsconfig.frontend.json"` — TypeScript resolves node_modules-style, không cần relative paths. Mỗi app thêm `"@ops/shared-config": "workspace:*"` vào dependencies là đủ. Pattern này chuẩn (dùng trong Turborepo official starter, create-t3-turbo, v.v.).

**Thay thế đã xem xét:** Đặt tsconfig.base.json tại root và dùng relative extends (`"extends": "../../tsconfig.base.json"`). Nhược điểm: relative paths dễ sai khi di chuyển app, và không phải là workspace package nên không benefit từ pnpm workspace resolution.

---

### D2: Tách thành 3 files (base / frontend / backend)

**Lựa chọn:** `tsconfig.base.json` → `tsconfig.frontend.json` và `tsconfig.backend.json`.

**Lý do:**
- **Frontend** cần `jsx: react-jsx` và `lib: [DOM, DOM.Iterable]` — backend (NestJS) không cần và không nên có DOM types.
- **Backend** cần `experimentalDecorators: true` và `emitDecoratorMetadata: true` cho NestJS DI system — frontend không cần.
- Nếu gộp 1 file, mọi app sẽ phải override bỏ settings không phù hợp.

**Base settings (chung):**
```json
{
  "strict": true,
  "target": "ES2022",
  "moduleResolution": "bundler",
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true
}
```

---

### D3: Xử lý `apps/api` — strict mode không tương thích

**Vấn đề:** `apps/api` hiện tại có `strictNullChecks: false`, `noImplicitAny: false`, `strictBindCallApply: false`. Backend tsconfig base sẽ có `strict: true`. Nếu extend mà không override → typecheck sẽ fail vì existing api code chưa được viết với strict mode.

**Quyết định:** `tsconfig.backend.json` đặt `strict: true` như mục tiêu dài hạn, nhưng `apps/api/tsconfig.json` sẽ giữ lại override block để tắt những settings này trong phase này:
```json
{
  "extends": "@ops/shared-config/tsconfig.backend.json",
  "compilerOptions": {
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "module": "commonjs",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": { "@/*": ["src/*"] }
  }
}
```
Phase tiếp theo có thể dần enable strict cho api riêng.

**Lý do `module: commonjs` giữ lại:** NestJS vẫn chạy trên CommonJS runtime. `moduleResolution: bundler` (từ base) chỉ ảnh hưởng type resolution, `module: commonjs` control emit — hai settings này có thể coexist.

---

### D4: Biome thay thế ESLint + Prettier

**Lựa chọn:** Biome v2 tại workspace root, single `biome.json`.

**Lý do:**
- **Performance:** Biome (Rust) nhanh hơn ESLint ~25x — với monorepo lớn dần, điều này quan trọng.
- **Đơn giản hóa:** 1 tool thay vì ESLint + nhiều plugins (typescript-eslint, eslint-plugin-react, prettier, eslint-plugin-prettier, tailwind plugin...).
- **Hiện trạng thực tế:** ESLint chỉ config ở 2/5 apps — `apps/shell`, `apps/team-app` chưa có ESLint config → migration cost thấp.
- **Biome rules ban đầu:** chỉ bật `recommended` set (tương đương ESLint recommended + TypeScript basics), không enable strict/opinionated rules.

**Thay thế đã xem xét:** Giữ ESLint, chỉ migrate tsconfig. Nhược điểm: ESLint config drift vẫn tồn tại, apps mới sẽ tiếp tục thiếu ESLint config.

**Lưu ý về `prettier-plugin-tailwindcss`:** Plugin này sắp xếp Tailwind classes theo canonical order. Biome không có tính năng tương đương ở thời điểm hiện tại. Trade-off được chấp nhận: class sorting là cosmetic, không ảnh hưởng functionality.

---

### D5: Biome chạy ở root-level, không qua turbo per-package

**Lựa chọn:** Root `package.json` scripts gọi Biome trực tiếp. Turbo tasks `lint`/`format` được cập nhật thành root-only commands.

**Lý do:** Biome scan toàn bộ workspace tree từ một lần chạy — không cần per-package scripts. Chạy qua turbo per-package sẽ tạo overhead không cần thiết (Biome tự handle ignore patterns qua `biome.json`).

**Turbo config sau migration:**
```json
{
  "lint": { "cache": false },
  "format": { "cache": false }
}
```
Bỏ `dependsOn: ["^lint"]` vì lint không còn per-package nữa.

## Risks / Trade-offs

**[Risk] Biome chưa cover toàn bộ ESLint rules của `apps/api`**
→ Mitigation: Review các rules custom trong `apps/api/eslint.config.mjs` và `packages/ui/eslint.config.js`, tìm Biome equivalent. Rules không có equivalent sẽ được ghi nhận và xử lý khi enable Biome rules strict hơn ở phase sau.

**[Risk] `apps/api` có `tsconfig.build.json` riêng cho NestJS build**
→ Mitigation: `tsconfig.build.json` extend từ `tsconfig.json` (local) nên chỉ cần migrate `tsconfig.json` là đủ — `tsconfig.build.json` sẽ tự inherit đúng settings.

**[Risk] `packages/ui` có `tsconfig.lint.json` và `eslint.config.ts`**
→ Mitigation: Xóa cả `tsconfig.lint.json` và ESLint configs khi migrate sang Biome. Biome không cần file tsconfig riêng cho lint.

**[Risk] `apps/team-app` có `tsconfig.dts.json` cho type generation**
→ Mitigation: File này độc lập với main tsconfig, không bị ảnh hưởng bởi migration. Giữ nguyên.

**[Trade-off] Tailwind class sorting mất đi**
→ Biome không sort Tailwind classes. Acceptable trong phase này — có thể dùng `prettier-plugin-tailwindcss` standalone sau nếu cần.

## Migration Plan

1. **Tạo `packages/shared-config`** — pnpm init, tạo 3 tsconfig files, thêm vào pnpm workspace
2. **Migrate tsconfigs** — update từng app/package để extend từ @ops/shared-config, giữ app-specific overrides
3. **Verify typecheck** — chạy `pnpm typecheck` để confirm không có regression
4. **Cài Biome** — `pnpm add -D -w @biomejs/biome`, tạo `biome.json` tại root
5. **Xóa ESLint/Prettier** — remove packages khỏi tất cả package.json, xóa config files
6. **Update scripts** — root package.json + turbo.json
7. **Verify lint/format** — `pnpm lint`, `pnpm format` pass clean

**Rollback:** Git revert. Không có database migration hay deployment — pure file changes.

## Open Questions

- Có cần giữ lại `prettier-plugin-tailwindcss` cho class sorting không? (Hiện tại: không — defer đến phase sau nếu team cần)
- `packages/shared-utils` có tsconfig riêng — cần kiểm tra xem nó thuộc frontend hay backend category? (Giả sử: frontend vì export cho React apps dùng)
