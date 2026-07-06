## ADDED Requirements

### Requirement: Settings entity là singleton — luôn tồn tại đúng 1 record
`apps/api/src/modules/settings/settings.entity.ts` SHALL định nghĩa entity `Settings` với các field: `id` (uuid, PK), `workspaceName` (string), `timezone` (string), `theme` (enum `'light' | 'dark'`, default `'dark'`), `inAppNotifications` (boolean, default `true`), `memberJoinAlert` (boolean, default `true`), `updatedAt` (timestamp, auto-update).

#### Scenario: Migration tạo bảng settings
- **WHEN** chạy `pnpm migration:run` trong `apps/api`
- **THEN** bảng `settings` được tạo với đúng các column trên

#### Scenario: Seed tạo 1 record mặc định
- **WHEN** chạy `pnpm seed` trong `apps/api`
- **THEN** bảng `settings` có đúng 1 record với `workspaceName: 'Ops Dashboard'`, `timezone: 'Asia/Ho_Chi_Minh'`, `theme: 'dark'`, `inAppNotifications: true`, `memberJoinAlert: true`

### Requirement: GET /api/v1/settings trả về record settings hiện tại
`SettingsController` SHALL expose `GET /api/v1/settings`. Nếu chưa có record nào (edge case), service SHALL tự tạo 1 record với default values rồi trả về, không throw `NotFoundException`.

#### Scenario: Fetch settings thành công
- **WHEN** gọi `GET /api/v1/settings`
- **THEN** trả về object settings hiện tại với đầy đủ field

#### Scenario: Chưa có record thì tự tạo default
- **WHEN** gọi `GET /api/v1/settings` mà bảng `settings` đang rỗng
- **THEN** service tạo 1 record mới với default values và trả về record đó, không lỗi 404

### Requirement: PATCH /api/v1/settings cập nhật partial fields
`SettingsController` SHALL expose `PATCH /api/v1/settings` nhận `UpdateSettingsDto` (tất cả field optional). Service SHALL chỉ update các field được gửi lên, giữ nguyên field khác. Nếu chưa có record, SHALL tạo mới (upsert) với default cho field không được gửi.

#### Scenario: Update 1 field giữ nguyên field khác
- **WHEN** gọi `PATCH /api/v1/settings` với body `{ theme: 'light' }` trong khi `workspaceName` hiện tại là `'Ops Dashboard'`
- **THEN** record trả về có `theme: 'light'` VÀ `workspaceName` vẫn là `'Ops Dashboard'`

#### Scenario: Update nhiều field cùng lúc
- **WHEN** gọi `PATCH /api/v1/settings` với body `{ workspaceName: 'New Name', timezone: 'America/New_York' }`
- **THEN** cả 2 field được cập nhật đúng giá trị mới

#### Scenario: PATCH khi chưa có record nào thì tạo mới
- **WHEN** gọi `PATCH /api/v1/settings` với body `{ theme: 'light' }` mà bảng `settings` đang rỗng
- **THEN** 1 record mới được tạo với `theme: 'light'` và default cho các field còn lại

### Requirement: SettingsModule không có auth guard
`SettingsController` KHÔNG áp dụng bất kỳ auth guard nào lên `/api/v1/settings` trong phase này.

#### Scenario: Gọi API không cần cookie/token
- **WHEN** gọi `GET /api/v1/settings` hoặc `PATCH /api/v1/settings` mà không có cookie session
- **THEN** request vẫn thành công (không trả về 401)
