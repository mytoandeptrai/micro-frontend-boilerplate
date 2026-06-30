import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ActivityItem, ActivityMeta } from "../hooks/useActivity"
import { ActivityLog } from "./ActivityLog"

const makeMeta = (overrides: Partial<ActivityMeta> = {}): ActivityMeta => ({
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  ...overrides,
})

const makeItem = (overrides: Partial<ActivityItem> = {}): ActivityItem => ({
  id: "a1",
  eventType: "CREATED",
  actorId: "u1",
  actorName: "Alice",
  targetId: "u1",
  targetName: "Alice",
  metadata: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe("ActivityLog", () => {
  it("renders activity items with badge and actor name", () => {
    render(
      <ActivityLog
        items={[makeItem()]}
        meta={makeMeta()}
        page={1}
        onPageChange={jest.fn()}
      />,
    )
    expect(screen.getByText("CREATED")).toBeInTheDocument()
    expect(screen.getByText("Alice")).toBeInTheDocument()
  })

  it("shows empty state when no items", () => {
    render(<ActivityLog items={[]} meta={makeMeta({ total: 0 })} page={1} onPageChange={jest.fn()} />)
    expect(screen.getByText("No activity yet.")).toBeInTheDocument()
  })

  it("shows pagination and calls onPageChange", async () => {
    const onPageChange = jest.fn()
    render(
      <ActivityLog
        items={[makeItem()]}
        meta={makeMeta({ totalPages: 3, page: 2 })}
        page={2}
        onPageChange={onPageChange}
      />,
    )
    await userEvent.click(screen.getByText("Next ›"))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
