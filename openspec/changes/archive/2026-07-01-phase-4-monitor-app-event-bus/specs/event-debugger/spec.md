## ADDED Requirements

### Requirement: EventDebugger chỉ mount trong DEV mode
Shell SHALL mount `<EventDebugger />` wrapped trong `{import.meta.env.DEV && ...}`. Component MUST NOT được bundle trong production build.

#### Scenario: DEV mode hiển thị toggle button
- **WHEN** shell chạy ở DEV mode
- **THEN** floating button xuất hiện ở góc phải màn hình

#### Scenario: Production không có EventDebugger
- **WHEN** shell build với NODE_ENV=production
- **THEN** EventDebugger code không có trong bundle

### Requirement: Click toggle button mở Sheet panel với event log
EventDebugger SHALL có floating toggle button (fixed bottom-right). Click MUST mở Sheet panel từ phải hiển thị danh sách events đã publish kể từ khi app load.

#### Scenario: Toggle button mở Sheet
- **WHEN** user click toggle button
- **THEN** Sheet panel mở từ phía phải với event log

#### Scenario: Sheet hiển thị event count
- **WHEN** Sheet đang mở
- **THEN** header hiển thị tổng số events đã capture

### Requirement: EventList hỗ trợ search và filter theo event type
EventDebugger SHALL có SearchBar (filter theo content) và FilterBar (filter theo event type). Khi filter thay đổi, EventList MUST cập nhật ngay lập tức.

#### Scenario: Search filter events
- **WHEN** user nhập text vào SearchBar
- **THEN** chỉ events có payload chứa text đó được hiển thị

#### Scenario: Filter theo event type
- **WHEN** user chọn event type cụ thể trong FilterBar
- **THEN** chỉ events của type đó được hiển thị

### Requirement: EventItem hiển thị collapsible JSON payload
Mỗi event row SHALL hiển thị: timestamp, event type badge. Click MUST expand/collapse JSON payload viewer.

#### Scenario: Expand event item
- **WHEN** user click vào event row
- **THEN** JSON payload được hiển thị dưới dạng formatted JSON

### Requirement: Clear button xóa toàn bộ event log
EventDebugger SHALL có Clear button trong header. Click MUST xóa toàn bộ events khỏi local buffer (không ảnh hưởng event bus).

#### Scenario: Clear events
- **WHEN** user click Clear
- **THEN** EventList trở về empty state
