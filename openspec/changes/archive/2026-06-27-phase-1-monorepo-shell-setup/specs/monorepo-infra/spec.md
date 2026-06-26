## ADDED Requirements

### Requirement: Project được đặt tên đúng chuẩn
Root `package.json` SHALL có `name: "ops-dashboard"` phản ánh đúng tên project.

#### Scenario: Package name khớp với project identity
- **WHEN** đọc `name` field trong root `package.json`
- **THEN** giá trị phải là `"ops-dashboard"`

### Requirement: Không tồn tại apps/web placeholder
Thư mục `apps/web` SHALL bị xóa hoàn toàn khỏi monorepo.

#### Scenario: apps/web không còn trong workspace
- **WHEN** chạy `pnpm install` tại monorepo root
- **THEN** không có lỗi liên quan đến `apps/web` và thư mục đó không tồn tại

### Requirement: packages/ui dùng @ops/ui scope
`packages/ui/package.json` SHALL khai báo `name: "@ops/ui"`.

#### Scenario: Scope đúng trong package.json
- **WHEN** đọc `name` field của `packages/ui/package.json`
- **THEN** giá trị phải là `"@ops/ui"`

#### Scenario: Import @ops/ui resolve được trong monorepo
- **WHEN** một app trong workspace có `"@ops/ui": "workspace:*"` trong dependencies
- **THEN** `pnpm install` resolve thành công không có lỗi unresolved workspace package

### Requirement: Module Federation packages có mặt ở workspace root
Root `package.json` SHALL khai báo `@module-federation/rsbuild-plugin` và `@module-federation/enhanced` trong dependencies (hoặc devDependencies).

#### Scenario: MF packages được install
- **WHEN** chạy `pnpm install` tại monorepo root
- **THEN** cả hai packages xuất hiện trong `node_modules` tại root

### Requirement: Turbo outputs khớp với Rsbuild output path
`turbo.json` SHALL khai báo `outputs: ["dist/**"]` cho pipeline `build`.

#### Scenario: Build pipeline không warning về output path
- **WHEN** chạy `turbo build`
- **THEN** không có warning về misconfigured hoặc missing output paths
