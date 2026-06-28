import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { MemoryRouter } from "react-router-dom"
import * as useMembers from "../hooks/useMembers"
import MemberList from "./MemberList"

jest.mock("../hooks/useMembers")

const mockMembers = [
  {
    id: "1",
    name: "Alice",
    email: "alice@ops.dev",
    role: "admin",
    status: "active",
    avatar: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@ops.dev",
    role: "member",
    status: "inactive",
    avatar: null,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
]

function renderMemberList(url = "/team") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[url]}>
        <MemberList />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("MemberList", () => {
  beforeEach(() => {
    ;(useMembers.useMembers as jest.Mock).mockReturnValue({
      data: {
        data: mockMembers,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
      isLoading: false,
    })
  })

  it("renders member rows", () => {
    renderMemberList()
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("alice@ops.dev")).toBeInTheDocument()
  })

  it("renders loading state", () => {
    ;(useMembers.useMembers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    })
    renderMemberList()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders empty state when no members", () => {
    ;(useMembers.useMembers as jest.Mock).mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      isLoading: false,
    })
    renderMemberList()
    expect(screen.getByText("No members found")).toBeInTheDocument()
  })

  it("passes name filter to hook when search input changes", async () => {
    const user = userEvent.setup()
    renderMemberList()
    const input = screen.getByPlaceholderText("Search name...")
    await user.type(input, "alice")
    await waitFor(() => {
      expect(useMembers.useMembers).toHaveBeenCalledWith(
        expect.objectContaining({ name: "alice" }),
      )
    })
  })
})
