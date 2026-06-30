## 1. Event Bus — packages/shared

- [x] 1.1 Tạo `packages/shared/src/event-bus/index.ts`: định nghĩa `AppEventMap`, implement `publishEvent` và `subscribeEvent` với singleton listeners map
- [x] 1.2 Tạo `packages/shared/src/hooks/useEventSubscription.ts`: React hook gọi `subscribeEvent` khi mount, unsubscribe khi unmount, stable handler reference với useRef
- [x] 1.3 Update `packages/shared/src/index.ts`: export `publishEvent`, `subscribeEvent`, `AppEventMap`, `useEventSubscription`
- [x] 1.4 Verify: `@ops/shared` export được đúng, TypeScript type-check với `AppEventMap` không cho phép payload sai type

## 2. EventDebugger — packages/ui

- [x] 2.1 Cài Sheet component từ shadcn/ui vào `packages/ui`
- [x] 2.2 Tạo `packages/ui/src/devtools/hooks/useEventFilters.ts`: search string state + selected event types state + filtered events logic
- [x] 2.3 Tạo các components con: `EventDebuggerToggle.tsx` (fixed bottom-right button), `EventDebuggerHeader.tsx` (title + count + clear button), `SearchBar.tsx`, `FilterBar.tsx`, `EmptyState.tsx`
- [x] 2.4 Tạo `EventItem.tsx`: collapsible row hiển thị timestamp, event type badge, JSON payload khi expand
- [x] 2.5 Tạo `EventList.tsx`: render danh sách EventItem, dùng filtered events từ hook
- [x] 2.6 Tạo `packages/ui/src/devtools/EventDebugger.tsx`: root component — floating toggle + Sheet wrapper, subscribe ALL event types, buffer events trong local state
- [x] 2.7 Export `EventDebugger` từ `packages/ui/src/index.ts`
- [x] 2.8 Verify: `@ops/ui` export được `EventDebugger`, component render không lỗi

## 3. Scaffold Monitor App

- [x] 3.1 Tạo `apps/monitor-app/` với cấu trúc: `package.json`, `tsconfig.json`, `rsbuild.config.ts`, `public/index.html`, `src/index.tsx`, `src/bootstrap.tsx`, `src/App.tsx`
- [x] 3.2 `src/index.tsx`: chỉ `import('./bootstrap')` (bootstrap pattern)
- [x] 3.3 `src/bootstrap.tsx`: wrap App với `QueryClientProvider` (standalone mode)
- [x] 3.4 Thêm `apps/monitor-app` vào `pnpm-workspace.yaml` và root `package.json` workspaces nếu cần
- [x] 3.5 Cài dependencies: `@rsbuild/core`, `@rsbuild/plugin-react`, `@module-federation/rsbuild-plugin`, `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `@ops/shared`, `@ops/ui`
- [x] 3.6 Setup Tailwind: import `@ops/ui/globals.css` trong bootstrap
- [x] 3.7 Verify: `pnpm --filter monitor-app dev` chạy được tại localhost:3002 không lỗi

## 4. Module Federation Config

- [x] 4.1 `apps/monitor-app/rsbuild.config.ts`: config MF với `name: "monitorApp"`, `filename: "remoteEntry.js"`, `remotes: { shell }`, `exposes: { "./App" }`, shared deps singleton
- [x] 4.2 Thêm `SHELL_URL`, `MONITOR_APP_URL`, `API_URL` env vars vào monitor-app, tạo `.env.example` và `.env.local`
- [x] 4.3 `apps/shell/rsbuild.config.ts`: thêm `monitorApp` vào remotes, thêm `MONITOR_APP_URL` env var
- [x] 4.4 Update `apps/shell/.env.example` và `.env.local` thêm `MONITOR_APP_URL=http://localhost:3002`
- [x] 4.5 Update `apps/shell/src/remotes.d.ts`: thêm type declaration cho `monitorApp/App`
- [x] 4.6 Verify: shell nhận diện được `monitorApp` remote, không có TypeScript error

## 5. Backend — Activity + Stats Entities

- [x] 5.1 Tạo `apps/api/src/modules/activity/activity.entity.ts`: id (UUID), eventType (enum), actorId (UUID), targetId (UUID), metadata (jsonb), createdAt
- [x] 5.2 Tạo `apps/api/src/modules/stats/stats.entity.ts`: id (UUID), totalMembers, activeMembers, adminCount, memberCount, viewerCount, updatedAt
- [x] 5.3 Tạo migration `CreateActivityAndStatsTable` với cả 2 bảng
- [x] 5.4 Tạo stats seed: tính initial stats từ members table hiện có (COUNT, GROUP BY role, status)
- [x] 5.5 Verify: `pnpm migration:run` tạo được 2 bảng, stats có 1 record initial với đúng counts

## 6. Backend — Transaction CRUD Sync

- [x] 6.1 Tạo `apps/api/src/modules/activity/activity.module.ts` và `activity.service.ts` (createActivity helper)
- [x] 6.2 Tạo `apps/api/src/modules/stats/stats.module.ts` và `stats.service.ts` (updateStats helper)
- [x] 6.3 Refactor `MembersService.create`: wrap trong `dataSource.transaction()` — INSERT member + INSERT activity(CREATED) + UPDATE stats (+1 total, +1 active nếu active, +1 roleCount)
- [x] 6.4 Refactor `MembersService.update`: wrap trong transaction — UPDATE member + INSERT activity(UPDATED) + UPDATE stats (adjust counts nếu role/status thay đổi)
- [x] 6.5 Refactor `MembersService.remove`: wrap trong transaction — soft-delete member + INSERT activity(DELETED) + UPDATE stats (-1 total, -1 active nếu active, -1 roleCount)
- [x] 6.6 Verify: sau mỗi CRUD, activity log có record mới, stats được cập nhật đúng, transaction rollback khi fail

## 7. Backend — Stats + Activity Endpoints

- [x] 7.1 Tạo `StatsController` với `GET /api/v1/stats` → return stats record
- [x] 7.2 Tạo `ActivityController` với `GET /api/v1/activity?page&limit` → paginated list, populate actor/target name, sort createdAt DESC
- [x] 7.3 Register modules trong `AppModule`
- [x] 7.4 Verify: `GET /api/v1/stats` trả về stats object; `GET /api/v1/activity` trả về paginated list với actor/target names

## 8. Backend — Unit Tests

- [x] 8.1 Test `MembersService.create`: verify activity record có eventType=CREATED, stats được update đúng
- [x] 8.2 Test `MembersService.remove`: verify activity record có eventType=DELETED, stats được update đúng
- [x] 8.3 Test transaction rollback: mock activity insert throw error → verify member không tồn tại
- [x] 8.4 Verify: `jest --testPathPattern=members|activity|stats` pass

## 9. Monitor App — Bootstrap + TanStack Query Hooks

- [x] 9.1 Tạo `apps/monitor-app/src/hooks/useStats.ts`: `useQuery` GET `/api/v1/stats`, staleTime 30s
- [x] 9.2 Tạo `apps/monitor-app/src/hooks/useActivity.ts`: `useQuery` GET `/api/v1/activity` với page state, staleTime 30s
- [x] 9.3 Verify: hooks fetch đúng data từ API trong standalone mode

## 10. Monitor App — StatsCard + Dashboard

- [x] 10.1 Tạo `apps/monitor-app/src/components/StatsCard.tsx`: hiển thị label, value, optional icon
- [x] 10.2 Tạo `apps/monitor-app/src/pages/Dashboard.tsx`: render 5 StatsCard (total, active, admin, member role, viewer), dùng `useStats`
- [x] 10.3 RTL test cho `StatsCard`: render đúng label và value
- [x] 10.4 Verify: Dashboard hiển thị đúng 5 stats cards với data từ API

## 11. Monitor App — ActivityLog Component

- [x] 11.1 Tạo `apps/monitor-app/src/components/ActivityLog.tsx`: list events với timestamp, actor name, target name, eventType badge, pagination controls
- [x] 11.2 RTL test cho `ActivityLog`: render đúng items, pagination hoạt động
- [x] 11.3 Verify: ActivityLog hiển thị đúng activity list từ API

## 12. Monitor App — SimpleChart (lazy loaded)

- [x] 12.1 Cài `recharts` vào `apps/monitor-app`
- [x] 12.2 Tạo `apps/monitor-app/src/components/SimpleChart.tsx`: LineChart (members over time từ Member.createdAt) + BarChart (activity by day)
- [x] 12.3 Lazy load SimpleChart trong Dashboard: `const SimpleChart = lazy(() => import('./components/SimpleChart'))` với Suspense fallback
- [x] 12.4 Verify: Charts render đúng data, lazy load không block Stats cards

## 13. Monitor App — Event Bus Subscription

- [x] 13.1 Dashboard.tsx dùng `useEventSubscription('member:added', ...)`: invalidate `['stats']` query key
- [x] 13.2 Dashboard.tsx dùng `useEventSubscription('member:removed', ...)`: invalidate `['stats']` query key
- [x] 13.3 RTL test: mock `publishEvent('member:added', ...)` → verify `useStats` được invalidate (queryClient.invalidateQueries called)
- [x] 13.4 Verify: thêm member ở /team → /monitor stats cập nhật ngay không cần refresh

## 14. Team App — Publish Events

- [x] 14.1 `apps/team-app/src/hooks/useMemberMutations.ts` — `useCreateMember`: sau `onSuccess`, gọi `publishEvent('member:added', { member, sourceInstanceId: 'team-app' })`
- [x] 14.2 `apps/team-app/src/hooks/useMemberMutations.ts` — `useDeleteMember`: sau `onSuccess`, gọi `publishEvent('member:removed', { memberId, sourceInstanceId: 'team-app' })`
- [x] 14.3 Verify: create/delete member ở team-app → EventDebugger trong shell hiển thị event

## 15. Shell — Update Routes + EventDebugger

- [x] 15.1 `apps/shell/src/App.tsx`: thêm `const MonitorApp = React.lazy(() => import('monitorApp/App'))` và route `monitor/*`
- [x] 15.2 `apps/shell/src/App.tsx`: thêm `{import.meta.env.DEV && <EventDebugger />}` (import từ `@ops/ui`)
- [x] 15.3 Verify: `/monitor` load được MonitorApp qua MF, EventDebugger button xuất hiện ở DEV mode

## 16. E2E Tests

- [x] 16.1 `apps/shell/e2e/monitor.spec.ts`: navigate tới `/monitor` → verify stats cards hiển thị
- [x] 16.2 `apps/shell/e2e/monitor.spec.ts`: thêm member ở `/team` → navigate về `/monitor` → verify totalMembers tăng
- [x] 16.3 Verify: `pnpm test:e2e` pass (cần tất cả services đang chạy)
