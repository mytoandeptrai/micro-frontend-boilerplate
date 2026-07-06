## MODIFIED Requirements

### Requirement: AppEventMap định nghĩa type-safe event contract
`@ops/shared` SHALL export `AppEventMap` interface với các keys:
- `'member:added'`: `{ member: Member; sourceInstanceId: string }`
- `'member:removed'`: `{ memberId: string; sourceInstanceId: string }`
- `'theme:change'`: `{ theme: 'light' | 'dark' }`

#### Scenario: TypeScript từ chối payload sai type
- **WHEN** developer gọi `publishEvent('member:added', { wrong: true })`
- **THEN** TypeScript compiler báo lỗi compile-time

#### Scenario: publishEvent theme:change với đúng payload
- **WHEN** developer gọi `publishEvent('theme:change', { theme: 'dark' })`
- **THEN** TypeScript compile không có lỗi, subscriber của `'theme:change'` nhận được `{ theme: 'dark' }`

#### Scenario: TypeScript từ chối payload sai type cho theme:change
- **WHEN** developer gọi `publishEvent('theme:change', { theme: 'blue' })`
- **THEN** TypeScript compiler báo lỗi compile-time vì `'blue'` không thuộc `'light' | 'dark'`
