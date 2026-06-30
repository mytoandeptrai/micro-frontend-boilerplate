import { publishEvent } from "@ops/shared"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render } from "@testing-library/react"
import Dashboard from "./Dashboard"

jest.mock("../hooks/useStats", () => ({
  useStats: () => ({
    data: {
      id: "s1",
      totalMembers: 5,
      activeMembers: 4,
      adminCount: 1,
      memberCount: 3,
      viewerCount: 1,
      updatedAt: new Date().toISOString(),
    },
    isLoading: false,
  }),
}))

jest.mock("../hooks/useActivity", () => ({
  useActivity: () => ({
    data: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } },
    isLoading: false,
    page: 1,
    setPage: jest.fn(),
  }),
}))

jest.mock("../components/SimpleChart", () => ({
  __esModule: true,
  default: () => <div data-testid="chart" />,
}))

describe("Dashboard event subscriptions", () => {
  it("invalidates stats query when member:added is published", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidate = jest.spyOn(qc, "invalidateQueries")

    render(
      <QueryClientProvider client={qc}>
        <Dashboard />
      </QueryClientProvider>,
    )

    await act(async () => {
      publishEvent("member:added", { memberId: "u2", sourceInstanceId: "team-app" })
    })

    expect(invalidate).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["stats"] }))
  })
})
