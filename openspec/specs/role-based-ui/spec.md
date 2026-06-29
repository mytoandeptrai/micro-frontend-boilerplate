# role-based-ui

## Purpose

TBD — defines requirements for role-based visibility of UI actions in the team-app micro-frontend, driven by the authenticated user's role from the shared global store.

## Requirements

### Requirement: Member list hiển thị/ẩn actions theo role
Team-app SHALL đọc `user` từ `shell/store` (via Module Federation) và áp dụng visibility rules cho action buttons dựa theo `user.role`.

Role hierarchy:
- `admin` — thấy: Create Member button, Edit button, Delete button
- `member` — thấy: Edit button; KHÔNG thấy: Create Member button, Delete button
- `viewer` — KHÔNG thấy: Create Member button, Edit button, Delete button

#### Scenario: Admin thấy đủ tất cả buttons
- **WHEN** user đăng nhập với role `admin` và truy cập `/team`
- **THEN** Create Member button hiển thị, mỗi member row có Edit button và Delete button

#### Scenario: Member thấy Edit nhưng không thấy Create/Delete
- **WHEN** user đăng nhập với role `member` và truy cập `/team`
- **THEN** Create Member button KHÔNG hiển thị, mỗi member row có Edit button nhưng KHÔNG có Delete button

#### Scenario: Viewer không thấy bất kỳ action button nào
- **WHEN** user đăng nhập với role `viewer` và truy cập `/team`
- **THEN** Create Member button, Edit button, Delete button đều KHÔNG hiển thị

### Requirement: RTL tests cover role-based visibility
Component tests SHALL verify visibility của Create/Edit/Delete buttons cho từng role (`admin`, `member`, `viewer`) bằng React Testing Library.

#### Scenario: RTL tests pass cho tất cả 3 roles
- **WHEN** chạy Jest tests cho MemberList component
- **THEN** tất cả role-based visibility scenarios pass

### Requirement: E2E tests verify role-based UI trong browser
Playwright SHALL có test scenarios: login với `viewer` và verify không thấy Delete button; login với `admin` và verify thấy đủ buttons.

#### Scenario: E2E viewer không thấy delete
- **WHEN** Playwright login với viewer credentials và navigate tới `/team`
- **THEN** selector cho Delete button không tồn tại trong DOM

#### Scenario: E2E admin thấy đủ buttons
- **WHEN** Playwright login với admin credentials và navigate tới `/team`
- **THEN** Create Member button và Delete button đều visible
