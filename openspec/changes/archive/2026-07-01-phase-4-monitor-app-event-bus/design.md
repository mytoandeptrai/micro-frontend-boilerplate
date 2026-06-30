## Context

Sau Phase 3, shell có auth state (Zustand), team-app có member CRUD (TanStack Query). Vấn đề: khi team-app tạo/xóa member, monitor-app không có cách nào biết để re-fetch stats mà không polling liên tục. Remote apps không được import trực tiếp nhau theo MF rules — giao tiếp phải qua `@ops/shared`.

## Goals / Non-Goals

**Goals:**
- Event bus in-memory: team-app publish → monitor-app subscribe → invalidate TanStack Query cache → re-fetch stats
- Monitor App (Remote 2) với Stats, Activity Log, Charts (recharts lazy-loaded)
- Backend: Activity + Stats entities, TypeORM transaction đảm bảo atomicity
- EventDebugger devtool: observe events real-time trong DEV mode

**Non-Goals:**
- WebSocket / Server-Sent Events (server-side real-time)
- Cross-tab sync (BroadcastChannel, localStorage)
- Cronjob stats recalculation
- Auth guard cho /api/stats và /api/activity
- Settings App (Phase 5)

## Decisions

### D1 — Event Bus: window-backed pub/sub over MF runtime events

> Tài liệu đầy đủ: [`event-bus.md`](../../../../event-bus.md) — bao gồm tất cả patterns, best practices, EventDebugger implementation guide, và giới hạn của approach này.

**Quyết định**: Implement custom pub/sub trong `packages/shared/src/event-bus/index.ts` với `window` làm backing store, thay vì dùng `@module-federation/enhanced` runtime events.

**Lý do**: MF runtime events focused vào container lifecycle (load, error), không phải business events. Custom pub/sub cho phép type-safe `AppEventMap`, tích hợp trực tiếp với React hook `useEventSubscription`.

**Implementation**:
```ts
export const publishEvent = <K extends keyof AppEventMap>(event: K, detail: AppEventMap[K]) => {
  window.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }))
}

export const subscribeEvent = <K extends keyof AppEventMap>(
  event: K,
  callback: (detail: AppEventMap[K]) => void,
) => {
  const handler = (e: Event) => callback((e as CustomEvent<AppEventMap[K]>).detail)
  window.addEventListener(event, handler)
  return () => window.removeEventListener(event, handler)
}
```

**Tại sao dùng native CustomEvent thay vì Map thủ công**: `window.dispatchEvent` / `window.addEventListener` chính là native event bus của browser — không cần reinvent. Tất cả apps trong cùng tab đều share cùng 1 `window`, nên events dispatch từ team-app sẽ được nhận bởi monitor-app qua listener đăng ký trên `window`. Module chỉ là lớp type-safe bọc bên ngoài — không cần quản lý registry thủ công hay dùng `as any`.

**Usage pattern — Publisher (team-app)**:
```ts
// Sau khi create member thành công
publishEvent("member:added", {
  member,
  sourceInstanceId: "team-app",
})
```

**Usage pattern — Subscriber (monitor-app hoặc shell)**:
```ts
// Pipe: Event Bus → Zustand Store hoặc TanStack Query invalidation
useEffect(() => {
  const unsubscribe = subscribeEvent("member:added", (payload) => {
    queryClient.invalidateQueries({ queryKey: ["stats"] })
  })
  return unsubscribe
}, [queryClient])
```

Pattern này tách biệt rõ: publisher không biết ai đang lắng nghe, subscriber không cần biết ai publish. `useEffect` cleanup đảm bảo unsubscribe khi component unmount — không leak listener.

**Chống event loop** (xem `event-bus.md` section 6): Khi một app vừa publish vừa subscribe cùng loại event — ví dụ team-app subscribe `member:added` để sync local state — nó sẽ nhận lại chính event mình vừa bắn → double-update hoặc infinite loop. Giải pháp: `sourceInstanceId` trong payload. Subscriber bỏ qua event nếu `sourceInstanceId === myInstanceId`:

```ts
// Publisher gắn ID nguồn
publishEvent("member:added", { member, sourceInstanceId: "team-app" })

// Subscriber bỏ qua event của chính mình
subscribeEvent("member:added", (payload) => {
  if (payload.sourceInstanceId === myInstanceId) return
  // xử lý event từ app khác
})
```

Quy tắc: mọi event two-way sync (cả hai phía đều có thể publish lẫn subscribe) đều phải có `sourceInstanceId` trong payload. Xem `AppEventMap` trong spec — `member:added` và `member:removed` đều enforce field này.

**Alternatives considered**: Zustand store (cho state hiện tại, không phù hợp event stream), Map thủ công trên `window` (reinvent thứ browser đã có sẵn), Redux (quá heavy).

---

### D2 — Monitor App bootstrap pattern

**Quyết định**: Monitor-app follow cùng bootstrap pattern như team-app:
- `src/index.tsx`: `import('./bootstrap')`
- `src/bootstrap.tsx`: wrap với `QueryClientProvider` (standalone mode)
- MF expose `./App` không có Router wrapper — inherit từ shell's BrowserRouter

**Lý do**: Nhất quán với team-app. Shell cung cấp Router context, monitor-app dùng `Routes` trực tiếp. `QueryClientProvider` ở bootstrap đảm bảo standalone mode hoạt động độc lập.

**shell/store dependency**: Monitor-app cần `useStore` để đọc user info → import từ `shell/store` (MF virtual module) giống team-app.

---

### D3 — TypeORM Transaction strategy cho Activity + Stats sync

**Quyết định**: Wrap mỗi member CRUD operation trong `dataSource.transaction()`:
```
create:  INSERT member → INSERT activity(CREATED) → UPDATE stats(totalMembers+1, activeMembers+1, roleCount+1)
update:  UPDATE member → INSERT activity(UPDATED) → UPDATE stats(nếu role/status thay đổi)
delete:  soft-delete member → INSERT activity(DELETED) → UPDATE stats(totalMembers-1, ...)
```

**Lý do**: Atomicity — nếu INSERT activity fail, member vẫn được tạo nhưng stats không được cập nhật → inconsistent state. Transaction đảm bảo all-or-nothing.

**Stats design**: 1 record duy nhất (singleton pattern) — tính toán incremental thay vì re-aggregate toàn bộ table. Seed initial stats từ members table hiện có.

**Alternatives considered**: Event-driven (NestJS event emitter) sau khi save — không atomic, có thể miss events khi crash.

---

### D4 — recharts lazy loading

**Quyết định**: `const SimpleChart = lazy(() => import('./components/SimpleChart'))` trong monitor-app's Dashboard.

**Lý do**: recharts bundle ~400KB gzip. Lazy load tránh block initial render của Stats cards và Activity Log. Chart là "nice to have" — user thấy data ngay, chart load sau.

**Pattern**:
```tsx
<Suspense fallback={<ChartSkeleton />}>
  <SimpleChart data={...} />
</Suspense>
```

---

### D5 — EventDebugger: packages/ui devtool

**Quyết định**: EventDebugger là component trong `packages/ui/src/devtools/` (không phải trong shell). Shell mount `{import.meta.env.DEV && <EventDebugger />}`.

**Lý do**: Tách UI khỏi business logic. `packages/ui` đã có shadcn/ui — Sheet component available. EventDebugger subscribe to ALL events qua `subscribeEvent` và buffer trong local state.

**Structure**:
```
packages/ui/src/devtools/
  EventDebugger.tsx           — floating button + Sheet wrapper
  hooks/useEventFilters.ts    — search + filter state
  components/
    EventDebuggerToggle.tsx   — fixed bottom-right button
    EventDebuggerHeader.tsx   — title + count + clear
    SearchBar.tsx / FilterBar.tsx / EventList.tsx / EventItem.tsx / EmptyState.tsx
```

---

### D6 — Monitor App Module Federation config

**Quyết định**: monitor-app config:
```ts
name: "monitorApp",
filename: "remoteEntry.js",
remotes: { shell: `shell@${SHELL_URL}/mf-manifest.json` },
exposes: { "./App": "./src/App" },
shared: { react, "react-dom", "react-router-dom", "@tanstack/react-query", zustand — tất cả singleton: true, KHÔNG eager }
```

Shell thêm:
```ts
remotes: { monitorApp: `monitorApp@${MONITOR_APP_URL}/mf-manifest.json` }
```

**Lý do**: Nhất quán với team-app pattern. `MONITOR_APP_URL` từ env để hỗ trợ multi-env deployment.

## Risks / Trade-offs

**[Risk] Event bus mất events nếu subscriber chưa mount**: Nếu monitor-app chưa load khi team-app publish event → event bị drop. Mitigation: monitor-app invalidate TanStack Query cache khi mount (fetch fresh data), event bus chỉ dùng cho real-time updates, không phải data source chính.

**[Risk] Stats có thể desync nếu transaction logic sai**: Mitigation: Unit test coverage cho mỗi CRUD path, integration test verify stats sau mỗi operation.

**[Risk] recharts peer deps conflict**: recharts yêu cầu React ≥ 16. Với React 19 có thể có warnings. Mitigation: kiểm tra compatibility, nếu có vấn đề dùng `victory` hoặc `visx` thay thế.

**[Trade-off] Stats incremental vs re-aggregate**: Incremental (D3) nhanh hơn nhưng có thể drift nếu có direct DB writes. Với scope hiện tại (chỉ API writes), incremental là đủ.

**[Trade-off] In-memory event bus vs persistent**: Events mất khi page refresh. Acceptable vì monitor-app re-fetch khi mount — state luôn fresh từ API.
