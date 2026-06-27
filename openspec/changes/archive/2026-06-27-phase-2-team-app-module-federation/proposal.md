## Why

Phase 1 đã thiết lập monorepo, shell app (host), và testing infrastructure. Phase 2 mở rộng kiến trúc Module Federation bằng cách giới thiệu remote app đầu tiên (team-app), kết nối backend NestJS với Member entity, và cho phép shell load team-app lúc runtime mà không cần rebuild. Đây là bước kiểm chứng thực tế rằng MF architecture hoạt động đúng end-to-end.

## What Changes

- **apps/team-app** — tạo mới: remote app (port 3001), expose `./App` qua Module Federation, hiển thị Member list với CRUD, search/filter, pagination, URL state qua nuqs
- **apps/shell** — cập nhật MF config: thêm `teamApp@http://localhost:3001/remoteEntry.js` vào `remotes`, thêm routes `/team` và `/team/:id` lazy-load từ remote
- **apps/api** — thêm Member entity (TypeORM), migration tạo bảng `members`, CRUD endpoints public tại `/api/members`, seed data 10-15 members
- **packages/ui** — cài thêm shadcn components: Table, Dialog, Card, Badge, Checkbox, Form, Input, Label, Popover, ScrollArea, Select, Textarea, Tooltip, Sonner; export từ `@ops/ui`

## Capabilities

### New Capabilities

- `member-management`: Quản lý danh sách thành viên — CRUD (create, read, update, soft delete), search theo tên, filter theo role/status, pagination; trạng thái filter/trang sync lên URL params qua nuqs
- `module-federation-team-remote`: team-app được đóng gói và expose qua Module Federation; shell load `remoteEntry.js` lúc runtime, negotiate shared deps (react, react-dom, react-router-dom, @tanstack/react-query, zustand) để không load 2 lần
- `shared-ui-components`: Bổ sung bộ shadcn components vào `@ops/ui` để các remote app dùng chung mà không bundle riêng từng app

### Modified Capabilities

- `shell-app`: Thêm remote `teamApp` vào MF config và bổ sung routes `/team`, `/team/:id` — thay đổi requirements ở tầng routing và host configuration

## Impact

**Apps bị ảnh hưởng:**
- `apps/api` — Member entity, TypeORM migration, MembersModule (service, controller, DTOs), seed script
- `apps/shell` — rsbuild.config.ts (remotes), routes.tsx (lazy remote routes)
- `apps/team-app` — tạo mới hoàn toàn: rsbuild + MF config, React app, hooks, pages

**Packages bị ảnh hưởng:**
- `packages/ui` — thêm shadcn components, cập nhật barrel export `src/index.ts`

**Dependencies mới:**
- `apps/team-app`: nuqs, @tanstack/react-query, react-router-dom, tailwindcss v4
- `packages/ui`: shadcn/ui components (Table, Dialog, Card, Badge, Checkbox, Form, Input, Label, Popover, ScrollArea, Select, Textarea, Tooltip, Sonner)
- `apps/api`: không cần dep mới (TypeORM, class-validator đã có)

**Database:**
- Migration tạo bảng `members` trong PostgreSQL (UUID PK, soft delete qua `status` enum)

## Non-goals

- Không implement Zustand global store hay auth (Phase 3)
- Không implement event bus hay cross-app communication (Phase 4)
- Không tạo monitor-app hay settings-app (Phase 4, 5)
- Không có error boundary cho remote fail (Phase 6)
- Không có role-based access control hay permission guard
