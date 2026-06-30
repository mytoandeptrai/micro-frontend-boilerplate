## ADDED Requirements

### Requirement: Activity entity ghi lại mọi member CRUD operation
Hệ thống SHALL tạo một `Activity` record sau mỗi create, update, delete member. Activity record MUST chứa: `eventType` (MEMBER_CREATED | MEMBER_UPDATED | MEMBER_DELETED), `actorId` (UUID của user thực hiện), `targetId` (UUID của member bị tác động), `metadata` (jsonb), `createdAt`.

#### Scenario: Create member tạo activity record
- **WHEN** admin tạo member mới thành công
- **THEN** một Activity record với `eventType = MEMBER_CREATED` và `targetId = newMember.id` được tạo trong cùng transaction

#### Scenario: Delete member tạo activity record
- **WHEN** admin xóa member
- **THEN** một Activity record với `eventType = MEMBER_DELETED` và `targetId = deletedMember.id` được tạo trong cùng transaction

### Requirement: Stats entity luôn phản ánh trạng thái hiện tại của members table
Hệ thống SHALL duy trì một `Stats` record duy nhất với: `totalMembers`, `activeMembers`, `adminCount`, `memberCount`, `viewerCount`, `updatedAt`. Stats MUST được cập nhật trong cùng transaction với member operation.

#### Scenario: Create active admin member cập nhật stats
- **WHEN** member mới với role=admin và status=active được tạo
- **THEN** `totalMembers += 1`, `activeMembers += 1`, `adminCount += 1`

#### Scenario: Delete member cập nhật stats
- **WHEN** member với role=member và status=active bị xóa
- **THEN** `totalMembers -= 1`, `activeMembers -= 1`, `memberCount -= 1`

### Requirement: Transaction rollback nếu bất kỳ bước nào fail
Member CRUD, Activity insert, và Stats update MUST nằm trong cùng một database transaction. Nếu bất kỳ bước nào fail, toàn bộ transaction MUST rollback.

#### Scenario: Activity insert fail thì member cũng không được tạo
- **WHEN** INSERT member thành công nhưng INSERT activity fail
- **THEN** member không tồn tại trong database sau transaction

### Requirement: GET /api/stats trả về stats record hiện tại
API SHALL expose `GET /api/v1/stats` endpoint. Response MUST trả về stats record với tất cả fields.

#### Scenario: Fetch stats thành công
- **WHEN** client gọi `GET /api/v1/stats`
- **THEN** response có status 200 với stats object đầy đủ

### Requirement: GET /api/activity trả về paginated activity list
API SHALL expose `GET /api/v1/activity` endpoint với pagination. Response MUST bao gồm actor name và target name (populated từ members table), sorted by `createdAt DESC`.

#### Scenario: Fetch activity list với pagination
- **WHEN** client gọi `GET /api/v1/activity?page=1&limit=10`
- **THEN** response có `data` array (≤10 items) và `meta` với total, page, totalPages

#### Scenario: Activity item có actor và target name
- **WHEN** activity record có `actorId` và `targetId`
- **THEN** response item chứa `actorName` và `targetName` (không chỉ UUID)
