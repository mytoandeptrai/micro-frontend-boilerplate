## 1. Shared UI Components (@ops/ui)

- [x] 1.1 Cài shadcn components vào packages/ui: Table, Dialog, Card, Badge, Checkbox, Form, Input, Label, Popover, ScrollArea, Select, Textarea, Tooltip, Sonner (chạy `npx shadcn@latest add` trong packages/ui)
- [x] 1.2 Export tất cả components mới từ `packages/ui/src/index.ts`
- [x] 1.3 Kiểm tra TypeScript: `pnpm --filter @ops/ui tsc --noEmit` pass

## 2. Scaffold apps/team-app

- [x] 2.1 Tạo `apps/team-app` với Rsbuild + React + TypeScript (port 3001): tạo `package.json`, `rsbuild.config.ts`, `tsconfig.json`, `src/index.tsx`, `src/bootstrap.tsx`, `src/App.tsx`
- [x] 2.2 Thêm `apps/team-app` vào pnpm workspace và Turborepo pipeline
- [x] 2.3 Cài dependencies: `@tanstack/react-query`, `react-router-dom`, `nuqs`, `@ops/ui`, `tailwindcss`

## 3. Module Federation Configuration

- [x] 3.1 Config `apps/team-app/rsbuild.config.ts`: `pluginModuleFederation` với `name: "teamApp"`, `filename: "remoteEntry.js"`, `exposes: { "./App": "./src/App" }`, shared deps `singleton: true` (KHÔNG `eager`)
- [x] 3.2 Cập nhật `apps/shell/rsbuild.config.ts`: thêm `teamApp: "http://localhost:3001/remoteEntry.js"` vào `remotes`
- [ ] 3.3 Verify: `pnpm build --filter=team-app` sinh ra `dist/remoteEntry.js`

## 4. TailwindCSS + @ops/ui trong team-app

- [x] 4.1 Tạo CSS entry file trong team-app với `@import "@ops/ui/globals.css"` (không dùng tailwind.preset riêng)
- [x] 4.2 Import CSS entry trong `src/bootstrap.tsx`
- [ ] 4.3 Verify Tailwind classes và shadcn components render đúng tại `localhost:3001`

## 5. Bootstrap Pattern cho team-app

- [x] 5.1 `src/index.tsx` chỉ chứa `import('./bootstrap')`
- [x] 5.2 `src/bootstrap.tsx` wrap App với `QueryClientProvider` (standalone mode) và `BrowserRouter`
- [ ] 5.3 Verify: `pnpm dev --filter=team-app` → `localhost:3001` không có lỗi console

## 6. Backend — Member Entity + Migration

- [x] 6.1 Tạo `apps/api/src/modules/members/member.entity.ts` với đầy đủ fields (id UUID, name, email unique, role enum, avatar, status enum, createdAt, updatedAt)
- [ ] 6.2 Chạy `pnpm migration:generate --name=CreateMemberTable` trong `apps/api`
- [ ] 6.3 Review migration file generated, confirm columns và constraints đúng
- [ ] 6.4 Chạy `pnpm migration:run` — bảng `members` tạo thành công

## 7. Backend — Members CRUD Endpoints

- [x] 7.1 Tạo `apps/api/src/modules/members/dto/create-member.dto.ts` và `update-member.dto.ts` với class-validator decorators
- [x] 7.2 Tạo `apps/api/src/modules/members/members.service.ts`: `findAll` (pagination + filter name/role/status), `findOne`, `create`, `update`, `softDelete`
- [x] 7.3 Tạo `apps/api/src/modules/members/members.controller.ts`: GET `/api/v1/members`, GET `/api/v1/members/:id`, POST `/api/v1/members`, PUT `/api/v1/members/:id`, DELETE `/api/v1/members/:id`
- [x] 7.4 Tạo `apps/api/src/modules/members/members.module.ts` và import vào `AppModule`
- [ ] 7.5 Verify endpoints: test thủ công với curl/Postman — list, create, get by id, update, soft delete

## 8. Backend — Seed Data

- [x] 8.1 Tạo `apps/api/src/shared/database/seeds/member.seed.ts` với 13 members đa dạng (mix role: admin/member/viewer, mix status: active/inactive)
- [ ] 8.2 Đảm bảo `pnpm seed` script chạy được và insert data vào DB

## 9. Backend — Unit Tests cho Members

- [x] 9.1 Tạo `apps/api/src/modules/members/members.service.spec.ts`: test `create`, `findAll` với các filter cases, `findOne`, `update`, `softDelete`
- [x] 9.2 Verify: `jest --testPathPattern=members` pass toàn bộ (13/13 pass)

## 10. Frontend — TanStack Query Hooks + nuqs

- [x] 10.1 Tạo `src/hooks/useMembers.ts`: `useQuery` GET `/api/v1/members`, nhận params (`page`, `name`, `role`, `status`) từ nuqs
- [x] 10.2 Tạo `src/hooks/useMember.ts`: `useQuery` GET `/api/v1/members/:id`
- [x] 10.3 Tạo `src/hooks/useMemberMutations.ts`: `useMutation` cho create, update, delete — toast success/error qua Sonner

## 11. Frontend — MemberList Page

- [x] 11.1 Tạo `src/pages/MemberList.tsx`: Table (shadcn) với cột avatar, name, email, role (Badge), status (Badge), createdAt
- [x] 11.2 Thêm search input (filter name), role Select, status Select — tất cả dùng `useQueryStates` từ nuqs
- [x] 11.3 Thêm pagination controls (prev/next, hiển thị page info)
- [x] 11.4 Row click → navigate tới `/team/:id`
- [ ] 11.5 Verify tại `localhost:3001/team`: search/filter/pagination hoạt động, URL params update, refresh giữ nguyên state

## 12. Frontend — MemberDetail Page

- [x] 12.1 Tạo `src/pages/MemberDetail.tsx`: route `/team/:id`, fetch member bằng `useMember`, view mode hiển thị đầy đủ thông tin
- [x] 12.2 Thêm edit mode với form (react-hook-form + shadcn Form), toggle qua `isEditing` state
- [x] 12.3 Save → `PUT /api/v1/members/:id` → toast success/error → quay lại view mode với data mới
- [x] 12.4 Cancel → reset form, quay lại view mode, không có API call

## 13. Frontend — React Router Setup trong team-app

- [x] 13.1 Thêm routes trong `src/App.tsx`: `/team` → MemberList, `/team/:id` → MemberDetail (react-router v6)
- [x] 13.2 Đặt `NuqsAdapter` từ `nuqs/adapters/react-router/v6` trong App wrapper

## 14. Shell — Update Routes

- [x] 14.1 Cập nhật `apps/shell/src/App.tsx`: lazy load `teamApp/App` cho `/team/*`
- [x] 14.2 Thêm TypeScript declaration cho `teamApp/App` module (`remotes.d.ts`)
- [ ] 14.3 Verify: `localhost:3000/team` → MemberList load từ `localhost:3001`, không có lỗi MF

## 15. Component Tests (React Testing Library)

- [x] 15.1 Tạo `src/pages/MemberList.test.tsx`: render đúng rows với mock data, search input trigger re-fetch, filter hoạt động
- [x] 15.2 Tạo `src/pages/MemberDetail.test.tsx`: toggle edit mode, Save gọi PUT mutation, Cancel không gọi API, toast hiển thị sau save
- [x] 15.3 Verify: `pnpm test --filter=team-app` pass (8/8 tests)

## 16. E2E Tests (Playwright)

- [x] 16.1 Tạo `e2e/team.spec.ts`: `localhost:3000/team` load được, search input filter rows, filter select hoạt động
- [x] 16.2 Thêm test: click row → navigate MemberDetail, hiển thị đúng thông tin member
- [x] 16.3 Thêm test: click Edit → form mở với data, Save thành công → toast success hiển thị
- [ ] 16.4 Verify: `pnpm test:e2e` pass
