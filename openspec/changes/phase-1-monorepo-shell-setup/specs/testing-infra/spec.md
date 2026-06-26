## ADDED Requirements

### Requirement: Jest + ts-jest config hoạt động tại monorepo root
Monorepo root SHALL có `jest.config.ts` (hoặc `jest.config.js`) với ts-jest transform, cho phép chạy TypeScript tests.

#### Scenario: pnpm test chạy không lỗi config
- **WHEN** chạy `pnpm test` tại monorepo root với không có test files
- **THEN** Jest exit với code 0 hoặc "no tests found" message, không có lỗi config/transform

#### Scenario: TypeScript test file được execute
- **WHEN** có một file `.test.tsx` với basic RTL test
- **THEN** Jest compile và run file đó thành công

### Requirement: Playwright config hoạt động tại monorepo root
Monorepo root SHALL có `playwright.config.ts` config E2E tests với baseURL `http://localhost:3000`.

#### Scenario: pnpm test:e2e chạy không lỗi config
- **WHEN** chạy `pnpm test:e2e` tại monorepo root với không có test files
- **THEN** Playwright exit không có lỗi config (có thể báo "no tests found")

### Requirement: Unit tests cho Header component pass
`apps/shell` SHALL có unit tests verify Header render đúng nội dung.

#### Scenario: Header test verify app title
- **WHEN** chạy unit tests cho Header
- **THEN** test "renders app title" pass — tìm thấy "Ops Dashboard" text trong rendered output

### Requirement: Unit tests cho Sidebar component pass
`apps/shell` SHALL có unit tests verify Sidebar render nav links và highlight active route.

#### Scenario: Sidebar test verify nav links count
- **WHEN** chạy unit tests cho Sidebar
- **THEN** test "renders nav links" pass — tìm thấy đủ 4 nav links trong rendered output

#### Scenario: Sidebar test verify active link highlight
- **WHEN** chạy unit tests cho Sidebar với route `/team`
- **THEN** test "highlights active route" pass — link `/team` có active indicator

### Requirement: E2E test cho shell navigation pass
`apps/shell` SHALL có Playwright test verify shell load và sidebar navigation hoạt động.

#### Scenario: E2E test verify shell load tại localhost:3000
- **WHEN** chạy E2E test và truy cập `localhost:3000`
- **THEN** test pass — page load thành công, layout hiển thị (Header + Sidebar)

#### Scenario: E2E test verify sidebar navigation
- **WHEN** E2E test click lần lượt vào Sidebar links
- **THEN** mỗi click navigate đúng route và test pass cho tất cả links
