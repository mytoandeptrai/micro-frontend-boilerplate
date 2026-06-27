## Context

Phase 1 đã hoàn thành monorepo setup với shell app (host) chạy tại port 3000, NestJS API, và testing infrastructure. Shell hiện có routes placeholder cho `/team`, `/monitor`, `/settings` nhưng chưa có remote nào thực sự.

Phase 2 triển khai remote app đầu tiên (team-app) để kiểm chứng toàn bộ luồng MF: team-app chạy standalone tại port 3001, shell load nó lúc runtime qua `remoteEntry.js`, shared deps được negotiate để không duplicate, và backend cung cấp Member CRUD API.

Constraint chính: Rsbuild + `@module-federation/rsbuild-plugin` (không phải Vite/Webpack), vì vậy các patterns cấu hình MF cần theo Rsbuild conventions.

## Goals / Non-Goals

**Goals:**
- Kiểm chứng MF architecture end-to-end: shell host load remote app lúc runtime
- Cung cấp Member CRUD UI hoàn chỉnh với search/filter/pagination, URL state
- Backend Member API đầy đủ (entity, migration, seed, CRUD endpoints)
- Shared deps singleton hoạt động đúng (React, TanStack Query không load 2 lần)
- team-app có thể chạy standalone (không cần shell)

**Non-Goals:**
- Auth/authorization (Phase 3)
- Zustand global store cho user/theme/locale (Phase 3)
- Event bus / cross-app communication (Phase 4)
- Error boundary khi remote fail (Phase 6)
- monitor-app, settings-app (Phase 4, 5)

## Decisions

### 1. Bootstrap pattern: index.tsx chỉ chứa dynamic import
**Quyết định:** `src/index.tsx` của cả shell và team-app chỉ chứa `import('./bootstrap')`.

**Lý do:** MF cần negotiate shared deps (quyết định dùng instance nào cho react, react-dom...) TRƯỚC KHI app code thực thi. Nếu `import React from 'react'` nằm ở top-level của `index.tsx`, module evaluator load React synchronously trước khi MF có cơ hội negotiate → 2 instances React chạy song song → hooks fail, context không share được.

Dynamic import tạo một async boundary: MF bootstrap chạy trước, negotiate xong, rồi mới evaluate `bootstrap.tsx`.

### 2. Remote app KHÔNG có `eager: true` cho shared deps
**Quyết định:** Chỉ shell (host) set `eager: true` cho `react` và `react-dom`. team-app và các remote khác dùng `singleton: true` nhưng KHÔNG `eager`.

**Lý do:** `eager: true` nghĩa là "load ngay khi chunk này được parse, không đợi negotiate". Nếu cả shell và remote đều `eager`, cả hai đều load React ngay lập tức → negotiate xảy ra quá muộn → 2 instances. Shell là host, render trước, nên shell cần `eager` để React sẵn sàng khi shell bootstrap. Remote app chờ shell negotiate xong rồi dùng instance của shell.

### 3. QueryClientProvider: shell's provider được dùng khi mount qua MF
**Quyết định:** `apps/team-app/src/bootstrap.tsx` tạo `QueryClientProvider` riêng cho standalone mode. Khi shell load team-app qua MF, shell's `QueryClientProvider` (ở cấp cao hơn trong React tree) sẽ được dùng thay thế vì React Context propagate qua MF boundary (React là singleton).

**Lý do:** Cách tiếp cận này cho phép team-app chạy độc lập (dev, test) mà không cần shell. Khi được mount vào shell, React's Context resolution tìm provider gần nhất → shell's provider được dùng → cache sharing hoạt động.

**Thay thế đã xem xét:** Truyền `queryClient` qua props từ shell → phức tạp hơn, tạo tight coupling. Context propagation tự nhiên hơn.

### 4. URL state qua nuqs (không phải useState + useEffect)
**Quyết định:** Dùng `nuqs` (`useQueryState`, `useQueryStates`) để sync filter/pagination state với URL.

**Lý do:** `nuqs` xử lý serialization/deserialization URL params một cách type-safe, tránh bug khi URL có giá trị không hợp lệ. State tự restore khi reload (URL là source of truth). Dùng `useState + useEffect` để sync URL thủ công dễ gây race condition và stale state.

**Thay thế đã xem xét:** `react-router` search params trực tiếp → verbose hơn, cần manual parsing/serialization.

### 5. Soft delete qua `status` field, không phải xóa record
**Quyết định:** `DELETE /api/members/:id` set `status: "inactive"` thay vì xóa record.

**Lý do:** Audit trail — có thể biết member từng tồn tại. Phase 3 khi có auth, có thể reactivate members. Tránh foreign key violation nếu member được reference ở bảng khác trong tương lai.

**Trade-off:** Filter mặc định của `GET /api/members` không lọc inactive — client phải tự filter nếu muốn chỉ xem active. Đây là intentional: UI có filter status để người dùng kiểm soát.

### 6. TailwindCSS v4 trong team-app: chỉ dùng `@import "@ops/ui/globals.css"`
**Quyết định:** KHÔNG dùng `tailwind.preset` hay config riêng trong team-app. Chỉ import `@ops/ui/globals.css` trong file CSS entry.

**Lý do:** TailwindCSS v4 không còn dùng `tailwind.config.js` theo cách cũ — config được inline vào CSS qua `@theme`. `@ops/ui/globals.css` đã định nghĩa toàn bộ design tokens. Import nó là đủ.

**Tham khảo:** Theo cách `apps/shell` đang config.

### 7. Member entity dùng UUID (gen_random_uuid()) thay vì integer PK
**Quyết định:** `id` là UUID generated bởi PostgreSQL (`DEFAULT gen_random_uuid()`).

**Lý do:** Consistent với pattern của các phase sau (cross-app references, potential distributed systems). UUID không expose thứ tự insert (bảo mật). TypeORM support `@PrimaryGeneratedColumn('uuid')` native.

## Risks / Trade-offs

**[Risk] Remote fail khi team-app chưa chạy** → Shell navigate tới `/team` nhưng `localhost:3001/remoteEntry.js` không response → blank screen hoặc JavaScript error.

Mitigation: Phase 6 sẽ thêm error boundary. Ở Phase 2, đây là known limitation — developer cần đảm bảo cả 2 process đang chạy khi dev.

**[Risk] Shared dep version mismatch giữa shell và team-app** → Nếu shell dùng react@19.0.0 và team-app dùng react@19.1.0, MF negotiate theo semver — có thể chọn version cao hơn hoặc báo lỗi.

Mitigation: Đồng bộ versions trong pnpm workspace catalog (đã có từ Phase 1). Review `pnpm-lock.yaml` sau khi cài deps cho team-app.

**[Risk] Quên wrap app với `NuqsAdapter`** → nuqs hoạt động tốt với React Router v6 nhưng cần `NuqsAdapter` từ `nuqs/adapters/react-router` để đọc/ghi URL params đúng. Nếu thiếu adapter, `useQueryState` không đọc được URL → params luôn trả về `null`.

Mitigation: Đặt `<NuqsAdapter>` wrap `<RouterProvider>` trong `App.tsx`. Verify bằng cách kiểm tra URL params update khi thay đổi filter.

**[Risk] Thiếu `@import "@ops/ui/globals.css"` trong CSS entry của team-app** → shadcn components render được (TypeScript ok, cn() đã có trong @ops/ui) nhưng CSS variables (`--background`, `--primary`, `--radius`...) không tồn tại → toàn bộ màu sắc và spacing sai.

Mitigation: Import `@ops/ui/globals.css` là bước đầu tiên khi setup Tailwind trong team-app. Verify bằng visual check tại localhost:3001, không phải TypeScript check.

## Migration Plan

Không có production migration. Đây là greenfield features trong development environment.

Sequence deploy local:
1. `pnpm migration:run` (tạo bảng members)
2. `pnpm seed` (optional, cho dev data)
3. `pnpm dev --filter=@ops/ui` (build UI package)
4. `pnpm dev --filter=team-app` (port 3001)
5. `pnpm dev --filter=shell` (port 3000)

## Open Questions

- **TanStack Query cache sharing**: Khi shell's `QueryClientProvider` được dùng thay `bootstrap.tsx`'s provider, cache key có bị collision không nếu shell cũng fetch `/api/members` sau này? → Unlikely vì shell chưa có member queries, nhưng cần document query key conventions.
- **nuqs NuqsAdapter placement**: Nên đặt ở `bootstrap.tsx` (cả standalone và MF mode) hay chỉ ở standalone bootstrap? → Đặt trong `App.tsx` hoặc `bootstrap.tsx` đều được, cần test cả 2 mode.
