import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { useStore } from "shell/store"
import { useDeleteMember } from "../hooks/useMemberMutations"
import { useMembers } from "../hooks/useMembers"
import MemberList from "./MemberList"

jest.mock("../hooks/useMembers")
jest.mock("../hooks/useMemberMutations")
jest.mock("shell/store")

const mockUseMembers = useMembers as jest.MockedFunction<typeof useMembers>

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
    mockUseMembers.mockReturnValue({
      data: {
        data: mockMembers,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof mockUseMembers>)
    ;(useDeleteMember as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false })
    ;(useStore.use.user as jest.Mock).mockReturnValue({ role: "admin" })
  })

  it("renders member rows", () => {
    renderMemberList()
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("alice@ops.dev")).toBeInTheDocument()
  })

  it("renders loading state", () => {
    mockUseMembers.mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof mockUseMembers>)
    renderMemberList()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders empty state when no members", () => {
    mockUseMembers.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      isLoading: false,
    } as unknown as ReturnType<typeof mockUseMembers>)
    renderMemberList()
    expect(screen.getByText("No members found")).toBeInTheDocument()
  })

  it("passes name filter to hook when search input changes", async () => {
    const user = userEvent.setup()
    renderMemberList()
    const input = screen.getByPlaceholderText("Search name...")
    await user.type(input, "alice")
    await waitFor(() => {
      expect(mockUseMembers).toHaveBeenCalledWith(
        expect.objectContaining({ name: "alice" }),
      )
    })
  })

  describe("role-based visibility", () => {
    it("shows Create button for admin", () => {
      ;(useStore.use.user as jest.Mock).mockReturnValue({ role: "admin" })
      renderMemberList()
      expect(screen.getByText("Create Member")).toBeInTheDocument()
    })

    it("hides Create button for member role", () => {
      ;(useStore.use.user as jest.Mock).mockReturnValue({ role: "member" })
      renderMemberList()
      expect(screen.queryByText("Create Member")).not.toBeInTheDocument()
    })

    it("hides Create, Edit and Delete buttons for viewer", () => {
      ;(useStore.use.user as jest.Mock).mockReturnValue({ role: "viewer" })
      renderMemberList()
      expect(screen.queryByText("Create Member")).not.toBeInTheDocument()
      expect(screen.queryAllByLabelText("Edit")).toHaveLength(0)
      expect(screen.queryAllByLabelText("Delete")).toHaveLength(0)
    })

    it("shows Edit and Delete buttons for member role", () => {
      ;(useStore.use.user as jest.Mock).mockReturnValue({ role: "member" })
      renderMemberList()
      expect(screen.getAllByLabelText("Edit")).toHaveLength(mockMembers.length)
      expect(screen.getAllByLabelText("Delete")).toHaveLength(mockMembers.length)
    })
  })
})
