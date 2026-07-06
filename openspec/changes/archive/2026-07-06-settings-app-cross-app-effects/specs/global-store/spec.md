## MODIFIED Requirements

### Requirement: GlobalState interface đúng shape
`GlobalState` SHALL chứa:
- `user: Member | null`
- `isAuthenticated: boolean` — explicit flag, không derive từ `user !== null`
- `isLoading: boolean` — true trong khi `/api/auth/me` đang pending
- `setUser: (user: Member | null) => void`
- `setAuthenticated: (v: boolean) => void`
- `setLoading: (v: boolean) => void`

`theme` và `setTheme` KHÔNG còn là một phần của `GlobalState`. `next-themes` là single source of truth duy nhất cho theme tại runtime; theme value được persist ở backend (`Settings.theme`) thay vì Zustand/localStorage.

#### Scenario: setUser cập nhật state
- **WHEN** gọi `useStore.getState().setUser(mockMember)`
- **THEN** `useStore.getState().user` bằng `mockMember`

#### Scenario: setUser với null clear user
- **WHEN** gọi `useStore.getState().setUser(null)`
- **THEN** `useStore.getState().user` là `null`

#### Scenario: setAuthenticated cập nhật flag
- **WHEN** gọi `useStore.getState().setAuthenticated(true)`
- **THEN** `useStore.getState().isAuthenticated` là `true`

#### Scenario: setLoading cập nhật flag
- **WHEN** gọi `useStore.getState().setLoading(false)`
- **THEN** `useStore.getState().isLoading` là `false`

#### Scenario: GlobalState không còn field theme
- **WHEN** kiểm tra type `GlobalState` trong `packages/shared/src/store.ts`
- **THEN** TypeScript compiler báo lỗi nếu code cố truy cập `useStore.getState().theme` hoặc gọi `useStore.getState().setTheme`

### Requirement: @ops/shared package tồn tại và export đúng API
Package `@ops/shared` (tại `packages/shared`) SHALL export: `useStore` (Zustand hook), `GlobalState` interface, `Member` type, `Role` enum, và shared constants. `Theme` type (`'light' | 'dark'`) SHALL vẫn được export từ `types.ts` để dùng cho `AppEventMap['theme:change']`, nhưng KHÔNG còn được dùng bởi `GlobalState`.

#### Scenario: Package build thành công
- **WHEN** chạy `pnpm build` trong `packages/shared`
- **THEN** build thành công, không có TypeScript errors

#### Scenario: Import từ @ops/shared trong shell
- **WHEN** import `{ useStore } from '@ops/shared/store'` trong shell code
- **THEN** TypeScript compile không có lỗi, `useStore` có đúng type
