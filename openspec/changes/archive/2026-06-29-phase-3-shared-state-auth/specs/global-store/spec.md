## ADDED Requirements

### Requirement: @ops/shared package tồn tại và export đúng API
Package `@ops/shared` (tại `packages/shared`) SHALL export: `useStore` (Zustand hook), `GlobalState` interface, `Member` type, `Role` enum, `Theme` type, và shared constants.

#### Scenario: Package build thành công
- **WHEN** chạy `pnpm build` trong `packages/shared`
- **THEN** build thành công, không có TypeScript errors

#### Scenario: Import từ @ops/shared trong shell
- **WHEN** import `{ useStore } from '@ops/shared/store'` trong shell code
- **THEN** TypeScript compile không có lỗi, `useStore` có đúng type

### Requirement: GlobalState interface đúng shape
`GlobalState` SHALL chứa:
- `user: Member | null`
- `isAuthenticated: boolean` — explicit flag, không derive từ `user !== null`
- `isLoading: boolean` — true trong khi `/api/auth/me` đang pending
- `theme: 'light' | 'dark'`
- `setUser: (user: Member | null) => void`
- `setAuthenticated: (v: boolean) => void`
- `setLoading: (v: boolean) => void`
- `setTheme: (theme: 'light' | 'dark') => void`

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

#### Scenario: setTheme cập nhật theme
- **WHEN** gọi `useStore.getState().setTheme('dark')`
- **THEN** `useStore.getState().theme` là `'dark'`

### Requirement: Shell expose store qua Module Federation
Shell `rsbuild.config.ts` SHALL có `exposes: { './store': '@ops/shared/store' }`. Build output SHALL chứa exposed module trong `remoteEntry.js`.

#### Scenario: Shell build expose store
- **WHEN** chạy `pnpm build` trong `apps/shell`
- **THEN** build thành công, `remoteEntry.js` tồn tại trong output

#### Scenario: Team-app import shell/store thành công
- **WHEN** import `{ useStore } from 'shell/store'` trong team-app (khi chạy qua shell host)
- **THEN** import resolve thành công, nhận đúng store singleton instance của shell

### Requirement: Zustand store là singleton qua MF boundary
Khi team-app import `shell/store`, SHALL nhận cùng store instance đang chạy trong shell — nghĩa là `setUser` từ shell và `user` đọc từ team-app SHALL phản ánh cùng state.

#### Scenario: State sync cross-app
- **WHEN** shell gọi `setUser(admin)` sau khi login
- **THEN** team-app đọc `useStore(s => s.user)` trả về `admin` (cùng instance)
