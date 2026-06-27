## ADDED Requirements

### Requirement: Member entity có đầy đủ fields
`members` table trong PostgreSQL SHALL có các fields: `id` (UUID, PK, gen_random_uuid()), `name` (string, not null), `email` (string, unique, not null), `role` (enum: admin | member | viewer, not null), `avatar` (string URL, nullable), `status` (enum: active | inactive, default: active), `createdAt` (timestamp, auto), `updatedAt` (timestamp, auto).

#### Scenario: Migration tạo bảng thành công
- **WHEN** chạy `pnpm migration:run` trên DB trống
- **THEN** bảng `members` tồn tại với đầy đủ columns và constraints (unique email, enum checks)

#### Scenario: Duplicate email bị reject
- **WHEN** tạo 2 members với cùng email
- **THEN** lần tạo thứ 2 trả về lỗi 409 Conflict

### Requirement: GET /api/members trả về danh sách phân trang
`GET /api/members` SHALL hỗ trợ query params: `page` (default 1), `limit` (default 10), `name` (partial match, case-insensitive), `role` (enum filter), `status` (enum filter). Response SHALL theo chuẩn pagination interceptor có sẵn: `{ data: Member[], meta: { page, limit, total, totalPages } }`.

#### Scenario: Lấy danh sách không filter
- **WHEN** `GET /api/members`
- **THEN** response có `data` array và `meta.total` bằng tổng số members trong DB

#### Scenario: Filter theo name
- **WHEN** `GET /api/members?name=john`
- **THEN** `data` chỉ chứa members có `name` chứa "john" (case-insensitive)

#### Scenario: Filter theo role
- **WHEN** `GET /api/members?role=admin`
- **THEN** `data` chỉ chứa members có `role === "admin"`

#### Scenario: Filter theo status
- **WHEN** `GET /api/members?status=inactive`
- **THEN** `data` chỉ chứa members có `status === "inactive"`

#### Scenario: Pagination hoạt động
- **WHEN** `GET /api/members?page=2&limit=5` với DB có 12 members
- **THEN** `data.length === 2`, `meta.page === 2`, `meta.totalPages === 3`

### Requirement: GET /api/members/:id trả về single member
`GET /api/members/:id` SHALL trả về member object đầy đủ. Nếu id không tồn tại, SHALL trả về 404.

#### Scenario: Lấy member tồn tại
- **WHEN** `GET /api/members/<valid-uuid>`
- **THEN** response là member object với đầy đủ fields

#### Scenario: Lấy member không tồn tại
- **WHEN** `GET /api/members/<non-existent-uuid>`
- **THEN** response 404 Not Found

### Requirement: POST /api/members tạo member mới
`POST /api/members` SHALL tạo member mới với body: `{ name, email, role, avatar? }`. `status` SHALL mặc định là `active`. Response SHALL là member object vừa tạo với HTTP 201.

#### Scenario: Tạo member hợp lệ
- **WHEN** `POST /api/members` với body `{ name: "Alice", email: "alice@ops.dev", role: "admin" }`
- **THEN** response 201 với member object có `id` (UUID) và `status: "active"`

#### Scenario: Tạo member thiếu field bắt buộc
- **WHEN** `POST /api/members` với body thiếu `email`
- **THEN** response 400 Bad Request với validation errors

### Requirement: PUT /api/members/:id cập nhật member
`PUT /api/members/:id` SHALL cập nhật toàn bộ fields (trừ `id`, `createdAt`). Nếu id không tồn tại, SHALL trả về 404. Response SHALL là member object sau khi update.

#### Scenario: Update hợp lệ
- **WHEN** `PUT /api/members/<valid-uuid>` với body `{ name: "Bob", email: "bob@ops.dev", role: "member", avatar: null }`
- **THEN** response là member object với data mới

#### Scenario: Update member không tồn tại
- **WHEN** `PUT /api/members/<non-existent-uuid>`
- **THEN** response 404 Not Found

### Requirement: DELETE /api/members/:id thực hiện soft delete
`DELETE /api/members/:id` SHALL KHÔNG xóa record khỏi DB. SHALL cập nhật `status` thành `inactive`. Response SHALL là member object với `status: "inactive"`. Nếu id không tồn tại, SHALL trả về 404.

#### Scenario: Soft delete thành công
- **WHEN** `DELETE /api/members/<valid-uuid>`
- **THEN** response là member object với `status: "inactive"`, record vẫn tồn tại trong DB

#### Scenario: Member sau soft delete vẫn fetch được
- **WHEN** `GET /api/members/<soft-deleted-uuid>`
- **THEN** response là member với `status: "inactive"` (không trả về 404)

### Requirement: Seed data cung cấp sẵn dữ liệu dev
Seed script SHALL insert 10-15 members với sự đa dạng: ít nhất 1 member mỗi role (admin, member, viewer), ít nhất 2 members có `status: "inactive"`.

#### Scenario: Seed chạy thành công
- **WHEN** chạy `pnpm seed`
- **THEN** bảng `members` có ít nhất 10 records, đủ 3 roles, và ít nhất 2 inactive

### Requirement: MemberList hiển thị table với search/filter/pagination
`MemberList` page SHALL hiển thị Table (shadcn) với các cột: avatar, name, email, role (Badge), status (Badge), createdAt. SHALL có search input (filter theo name), role select filter, status select filter, pagination controls. Tất cả state filter SHALL sync lên URL params (`page`, `name`, `role`, `status`) qua nuqs, và SHALL được restore khi reload trang.

#### Scenario: Table render đúng data
- **WHEN** truy cập `/team` với DB có seed data
- **THEN** table hiển thị đúng số rows theo pagination, mỗi row có name, email, role, status

#### Scenario: Search filter hoạt động và sync URL
- **WHEN** nhập "alice" vào search input
- **THEN** URL params có `name=alice`, table chỉ hiển thị rows có "alice" trong name

#### Scenario: Role filter hoạt động
- **WHEN** chọn "admin" trong role select
- **THEN** URL params có `role=admin`, table chỉ hiển thị admin members

#### Scenario: Pagination sync URL
- **WHEN** click next page
- **THEN** URL params có `page=2`, table hiển thị trang 2

#### Scenario: State restore sau reload
- **WHEN** URL là `/team?name=alice&role=admin&page=1` và người dùng reload
- **THEN** search input có giá trị "alice", role select có giá trị "admin", table filter đúng

#### Scenario: Row click navigate tới detail
- **WHEN** click vào một row trong table
- **THEN** navigate tới `/team/:id` với id của member đó

### Requirement: MemberDetail hiển thị và cho phép edit member
`MemberDetail` page SHALL hiển thị đầy đủ thông tin member (name, email, role, avatar, status, createdAt). SHALL có nút "Edit" để chuyển sang edit mode với form. SHALL có nút "Save" (submit PUT) và "Cancel" (quay lại view mode). Save thành công và thất bại SHALL hiển thị toast qua Sonner.

#### Scenario: View mode hiển thị đúng thông tin
- **WHEN** truy cập `/team/:id` với member hợp lệ
- **THEN** hiển thị name, email, role, status của member, không có form input

#### Scenario: Chuyển sang edit mode
- **WHEN** click "Edit"
- **THEN** hiển thị form với các input fields điền sẵn giá trị hiện tại

#### Scenario: Save thành công
- **WHEN** thay đổi name và click "Save"
- **THEN** `PUT /api/members/:id` được gọi, toast success hiển thị, view mode quay lại với data mới

#### Scenario: Save thất bại
- **WHEN** Save với email đã tồn tại (duplicate)
- **THEN** toast error hiển thị với message lỗi, form vẫn mở

#### Scenario: Cancel giữ nguyên data
- **WHEN** thay đổi fields rồi click "Cancel"
- **THEN** form đóng, data hiển thị như ban đầu, không có API call
