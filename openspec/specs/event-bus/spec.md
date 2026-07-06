# event-bus

## Purpose

Defines requirements for the in-process event bus exported from `@ops/shared`. Enables type-safe, cross-MFE communication within the same browser tab without direct imports between remotes.

## Requirements

### Requirement: publishEvent gửi event tới tất cả subscribers
`@ops/shared` SHALL export `publishEvent(type, payload)` function. Khi được gọi, tất cả handlers đã subscribe cho `type` đó MUST được invoke synchronously với `payload`.

#### Scenario: Publisher gửi event, subscriber nhận được
- **WHEN** subscriber A đã gọi `subscribeEvent('member:added', handler)`
- **AND** team-app gọi `publishEvent('member:added', { member, sourceInstanceId })`
- **THEN** `handler` được gọi với đúng payload `{ member, sourceInstanceId }`

#### Scenario: Publish khi không có subscriber
- **WHEN** không có subscriber nào cho event type
- **AND** `publishEvent` được gọi
- **THEN** không có error được throw, event bị drop silently

### Requirement: subscribeEvent trả về unsubscribe function
`subscribeEvent(type, handler)` SHALL trả về một function. Khi function đó được gọi, handler MUST bị remove khỏi subscriber list.

#### Scenario: Unsubscribe ngăn handler bị gọi
- **WHEN** subscriber gọi `subscribeEvent` và lưu return value
- **AND** subscriber gọi return value đó (unsubscribe)
- **AND** `publishEvent` được gọi sau đó
- **THEN** handler KHÔNG được gọi

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

### Requirement: useEventSubscription hook tự động cleanup
`@ops/shared` SHALL export `useEventSubscription(type, handler)` React hook. Hook MUST gọi `subscribeEvent` khi mount và gọi unsubscribe khi unmount.

#### Scenario: Component unmount tự unsubscribe
- **WHEN** component dùng `useEventSubscription` bị unmount
- **THEN** handler không còn được gọi khi event được publish

#### Scenario: Handler mới thay thế handler cũ
- **WHEN** component re-render với handler function mới
- **THEN** chỉ handler mới nhất được giữ lại (tránh stale closure)

### Requirement: Event bus singleton qua MF boundary
`@ops/shared` package MUST được shared với `singleton: true` trong tất cả MF configs. Listener map MUST là cùng 1 instance trong cùng tab browser.

#### Scenario: Cross-remote event delivery
- **WHEN** team-app (Remote 1) publish event
- **AND** monitor-app (Remote 2) đã subscribe
- **THEN** monitor-app nhận được event mà không cần direct import giữa 2 remotes
