## Why

Sau Phase 3, hệ thống đã có auth và team management. Tuy nhiên không có cách nào để quan sát hoạt động của hệ thống theo thời gian thực — admin không biết ai đang thêm/xóa member, không có stats tổng quan, không có activity log. Phase 4 giải quyết bằng cách tạo Monitor App (Remote 2) và Event Bus để các remote app giao tiếp với nhau mà không coupling trực tiếp.

## What Changes

- **packages/shared**: Thêm `event-bus` module (`publishEvent`, `subscribeEvent`, `AppEventMap`) và `useEventSubscription` React hook — cơ chế pub/sub in-memory cho cross-remote communication
- **packages/ui**: Thêm `EventDebugger` devtool — floating button + Sheet panel hiển thị event log real-time (DEV only)
- **apps/monitor-app**: Tạo mới Remote 2 (port 3002) — dashboard hiển thị Stats cards, Activity Log, Charts (recharts lazy-loaded)
- **apps/api**: Thêm `Activity` entity, `Stats` entity, migration, endpoints GET /api/stats + GET /api/activity; wrap member CRUD trong TypeORM transaction để sync activity log + stats atomically
- **apps/shell**: Mount `EventDebugger` (DEV only), thêm `monitorApp` remote, route `/monitor` lazy load Monitor App
- **apps/team-app**: Publish `member:added` / `member:removed` event sau mỗi mutation thành công

## Capabilities

### New Capabilities

- `event-bus`: In-memory pub/sub cho cross-remote communication — `publishEvent`, `subscribeEvent`, `AppEventMap`, `useEventSubscription` hook
- `monitor-app`: Remote 2 — Stats dashboard, Activity Log, Charts với recharts lazy-loaded, subscribe event bus để cập nhật real-time
- `activity-log`: Backend — Activity entity, Stats entity, TypeORM transaction sync trong member CRUD, REST endpoints
- `event-debugger`: DevTools UI — EventDebugger component (Sheet + event list) chỉ mount ở DEV mode

### Modified Capabilities

- `shell-app`: Thêm monitorApp remote config, route /monitor, mount EventDebugger DEV only

## Impact

**Apps bị ảnh hưởng:**
- `apps/api` — Activity entity, Stats entity, migration mới, MembersService refactor sang transaction
- `apps/shell` — rsbuild config thêm monitorApp remote, App.tsx thêm route + EventDebugger
- `apps/team-app` — useMemberMutations publish event sau create/delete
- `apps/monitor-app` — tạo mới hoàn toàn

**Packages bị ảnh hưởng:**
- `packages/shared` — thêm event-bus module + useEventSubscription hook, update index.ts exports
- `packages/ui` — thêm Sheet component (shadcn), thêm EventDebugger devtool, update index.ts exports

**Dependencies mới:**
- `recharts` — chỉ trong apps/monitor-app, lazy loaded
- `react-json-view` hoặc tương đương — chỉ trong packages/ui (EventDebugger payload viewer)
- `lucide-react` — packages/ui (đã có hoặc thêm mới cho icons)

**Non-goals:**
- Không implement Settings App (Phase 5)
- Không implement cronjob cho stats recalculation
- Không cross-tab sync (chỉ same-tab event bus)
- Không auth guard cho /api/stats và /api/activity (Phase sau)
- Không WebSocket real-time từ server — chỉ event bus client-side + TanStack Query invalidation
