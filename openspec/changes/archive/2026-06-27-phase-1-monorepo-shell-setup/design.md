## Context

Project hiện tại là một scaffold trống tên `micro-frontend` với `apps/web` chưa dùng và `packages/ui` dùng scope `@workspace/ui`. Cần thiết lập đúng nền tảng monorepo trước khi bắt đầu build các micro-frontend thật sự.

Phase 1 tập trung hoàn toàn vào shell app — host MF chạy độc lập, không phụ thuộc vào bất kỳ remote nào. Quyết định này cho phép shell được verify độc lập trước khi integrate remotes ở Phase 2.

## Goals / Non-Goals

**Goals:**
- Monorepo có cấu trúc đúng: rename, cleanup, @ops/ui scope
- Shell app chạy tại localhost:3000 với layout hoàn chỉnh
- Module Federation host config sẵn sàng nhận remotes (Phase 2)
- Testing infra hoạt động ở cả unit và E2E level

**Non-Goals:**
- Không connect bất kỳ MF remote nào
- Không implement Zustand store hay event bus
- Không tạo `packages/shared`
- Không build backend API
- Không implement real content trong placeholder pages

## Decisions

### 1. Rsbuild thay vì Vite cho shell app

Rsbuild được chọn vì `@module-federation/rsbuild-plugin` tích hợp native với Rspack — cùng ecosystem với Webpack Module Federation v2. Vite có plugin MF nhưng implementation khác biệt đáng kể, dễ sinh ra edge cases khi integrate nhiều remotes sau này.

**Thay thế đã cân nhắc:** Vite + `@originjs/vite-plugin-federation` — loại bỏ vì plugin này implement MF theo cách không tương thích hoàn toàn với Webpack MF v2 spec.

### 2. Bootstrap pattern bắt buộc (index.tsx → dynamic import)

`src/index.tsx` chỉ chứa `import('./bootstrap')`. Toàn bộ app code nằm trong `src/bootstrap.tsx`.

Lý do: Module Federation cần negotiate shared dependencies (React, React DOM...) **trước khi** bất kỳ module nào trong shared scope được execute. Nếu `index.tsx` import React synchronously ở top-level, React bundle load trước khi MF có cơ hội kiểm tra shared scope → React load 2 lần → hooks broken, context mất.

Dynamic import tạo một async boundary: MF negotiation chạy xong → sau đó bootstrap.tsx mới execute.

### 3. Shared deps: singleton + eager cho React/React DOM tại shell

```
react, react-dom: { singleton: true, eager: true }
react-router-dom, @tanstack/react-query, zustand: { singleton: true }
```

- `singleton: true`: Đảm bảo chỉ có một instance trong shared scope — bắt buộc cho React (hooks dùng module-level state), React Router (history object), Zustand (store state).
- `eager: true` chỉ ở shell cho React/React DOM: Shell là host, render đầu tiên synchronously. Nếu không có `eager`, MF sẽ lazy-load React → shell không render được trước khi remotes sẵn sàng. Remote apps không cần `eager` vì chúng được load sau khi shell đã init shared scope.

### 4. Rename @workspace/ui → @ops/ui

`@workspace/ui` là tên mặc định của scaffold tool. Đổi sang `@ops/ui` để:
- Nhất quán với naming convention của toàn project (`@ops/*`)
- Tránh conflict với các workspace tool khác dùng `@workspace/*` prefix
- Import paths rõ ràng hơn: `import { Button } from '@ops/ui'`

### 5. TailwindCSS v4 với preset pattern

Shell và các remote apps sẽ có config Tailwind riêng nhưng **extend từ `@ops/ui/tailwind.preset`**. Pattern này:
- Đảm bảo design tokens (colors, spacing, typography) nhất quán giữa tất cả apps
- Cho phép mỗi app thêm utility classes riêng nếu cần
- `@ops/ui/tailwind.preset` là single source of truth cho design system

### 6. React Router v6 với BrowserRouter tại shell level

Shell giữ `BrowserRouter` provider. Routing được define tại shell level vì shell là host — nó biết tất cả các "slot" và URL patterns. Remote apps sẽ nhận routing context từ shell thông qua shared React Router instance (singleton dep).

Các placeholder routes (`/team`, `/monitor`, `/settings`) được tạo ngay từ Phase 1 để:
- Sidebar navigation hoạt động được
- Structure rõ ràng cho Phase 2 khi remotes được mount vào đây

## Risks / Trade-offs

**[Risk] Bootstrap pattern thêm một async boundary** → Ảnh hưởng nhẹ đến perceived load time lần đầu. Mitigation: Rsbuild code-split tốt, overhead thực tế không đáng kể so với lợi ích MF correctness.

**[Risk] TailwindCSS v4 còn khá mới, API có thể thay đổi** → Mitigation: Pin version cụ thể trong package.json, không dùng experimental features.

**[Risk] Rename @workspace/ui → @ops/ui có thể miss references** → Mitigation: Sau khi update package.json, chạy `grep -r "@workspace/ui"` để verify không còn sót reference nào trước khi commit.

**[Trade-off] Turbo outputs: dist/** thay vì .output/*** → Rsbuild default output là `dist/`. Nếu sau này có tool nào expect `.output/`, cần update lại. Chấp nhận vì `dist/` là convention phổ biến hơn và ít gây nhầm lẫn hơn.
