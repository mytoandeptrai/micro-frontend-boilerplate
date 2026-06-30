## ADDED Requirements

### Requirement: Monitor App chạy standalone tại localhost:3002
Monitor App SHALL chạy độc lập tại port 3002 với đầy đủ Tailwind + @ops/ui. Bootstrap pattern MUST được áp dụng (index.tsx chỉ dynamic import bootstrap).

#### Scenario: Standalone mode không lỗi
- **WHEN** developer chạy `pnpm --filter monitor-app dev`
- **THEN** app load tại localhost:3002 không có console error liên quan MF

### Requirement: Dashboard hiển thị 5 Stats cards từ API
Dashboard SHALL render 5 StatsCard components: Total Members, Active Members, Admins, Members (role), Viewers. Data MUST được fetch từ `GET /api/v1/stats`.

#### Scenario: Stats cards hiển thị đúng data
- **WHEN** API trả về stats object
- **THEN** mỗi card hiển thị đúng label và giá trị tương ứng

#### Scenario: Loading state khi fetch
- **WHEN** query đang pending
- **THEN** skeleton/loading indicator được hiển thị thay cho value

### Requirement: ActivityLog hiển thị danh sách activity với pagination
ActivityLog component SHALL hiển thị list activity events với: timestamp, actor name, target name, eventType badge. Pagination MUST hoạt động với `GET /api/v1/activity`.

#### Scenario: Activity list render đúng items
- **WHEN** API trả về activity list
- **THEN** mỗi row hiển thị timestamp, actor name, target name, eventType badge

#### Scenario: Pagination navigate đúng page
- **WHEN** user click next page
- **THEN** query re-fetch với page parameter mới

### Requirement: SimpleChart lazy-loaded, không block initial render
SimpleChart component SHALL được lazy loaded (`React.lazy`). Nó MUST render một LineChart (members over time) và BarChart (activity by day) dùng recharts.

#### Scenario: Charts load sau stats cards
- **WHEN** Dashboard mount lần đầu
- **THEN** Stats cards và Activity Log hiển thị trước, Charts load sau với Suspense fallback

### Requirement: Dashboard tự cập nhật khi nhận event từ event bus
Dashboard SHALL subscribe `member:added` và `member:removed` events. Khi nhận được, MUST invalidate TanStack Query cache cho stats và refetch.

#### Scenario: Thêm member ở team-app → monitor stats cập nhật
- **WHEN** team-app tạo member mới và publish `member:added`
- **THEN** Dashboard của monitor-app tự re-fetch stats mà không cần page refresh

### Requirement: Monitor App được load qua Module Federation tại /monitor
Shell SHALL lazy load monitor-app tại route `/monitor`. MF remote name MUST là `monitorApp`.

#### Scenario: Navigate tới /monitor load monitor-app
- **WHEN** user navigate tới `/monitor` trong shell
- **THEN** monitor-app component được load và render qua MF
