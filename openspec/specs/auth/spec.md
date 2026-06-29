# auth

## Purpose

TBD — defines authentication requirements for the micro-frontend platform including JWT-based login, session management via httpOnly cookies, and auth API endpoints.

## Requirements

### Requirement: Member entity có password field
Member entity SHALL có field `password: string` (bcrypt hash, nullable: false). API responses SHALL KHÔNG bao giờ trả về `password` field.

#### Scenario: Password không xuất hiện trong API response
- **WHEN** gọi `GET /api/members` hoặc `GET /api/members/:id`
- **THEN** response body KHÔNG chứa field `password`

#### Scenario: Migration thêm password column thành công
- **WHEN** chạy `pnpm migration:run` trong `apps/api`
- **THEN** bảng `members` có column `password` (varchar, not null)

#### Scenario: Seed tạo members với password đã hash
- **WHEN** chạy `pnpm seed` sau migration
- **THEN** mỗi seeded member có `password` là bcrypt hash của `"password123"`

### Requirement: POST /api/auth/login xác thực credentials và set cookie
`POST /api/auth/login` SHALL nhận `{ email, password }`, xác thực với bcrypt, tạo JWT (HS256, secret từ env `JWT_SECRET`, expiry 7d), set JWT vào httpOnly cookie `ops_token` (SameSite=Lax, maxAge=7d), và trả về member object (không có password).

#### Scenario: Login với đúng credentials
- **WHEN** gửi `POST /api/auth/login` với email và password đúng
- **THEN** response status 200, body chứa member object, response header có `Set-Cookie` với `ops_token` httpOnly

#### Scenario: Login với sai password
- **WHEN** gửi `POST /api/auth/login` với email đúng nhưng password sai
- **THEN** response status 401, body có message `"Invalid credentials"`

#### Scenario: Login với email không tồn tại
- **WHEN** gửi `POST /api/auth/login` với email không có trong database
- **THEN** response status 401, body có message `"Invalid credentials"`

### Requirement: GET /api/auth/me trả về current user
`GET /api/auth/me` SHALL đọc JWT từ httpOnly cookie `ops_token`, verify, và trả về member hiện tại (không có password).

#### Scenario: Request với cookie hợp lệ
- **WHEN** gửi `GET /api/auth/me` với cookie `ops_token` hợp lệ
- **THEN** response status 200, body chứa member object của user đang đăng nhập

#### Scenario: Request không có cookie
- **WHEN** gửi `GET /api/auth/me` không có cookie
- **THEN** response status 401

#### Scenario: Request với JWT hết hạn
- **WHEN** gửi `GET /api/auth/me` với expired JWT trong cookie
- **THEN** response status 401

### Requirement: POST /api/auth/logout xóa cookie
`POST /api/auth/logout` SHALL clear cookie `ops_token` (set maxAge=0).

#### Scenario: Logout thành công
- **WHEN** gửi `POST /api/auth/logout`
- **THEN** response status 200, response header có `Set-Cookie` clear cookie `ops_token`

#### Scenario: Gọi /api/auth/me sau logout
- **WHEN** gọi `GET /api/auth/me` sau khi đã logout
- **THEN** response status 401

### Requirement: AuthService unit tests pass
AuthService SHALL có unit tests cover: login đúng credentials, login sai password, login email không tồn tại, getMe với userId hợp lệ.

#### Scenario: Jest tests pass
- **WHEN** chạy `jest --testPathPattern=auth` trong `apps/api`
- **THEN** tất cả tests pass, không có failures
