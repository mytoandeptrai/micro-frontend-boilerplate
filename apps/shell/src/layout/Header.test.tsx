import { useStore } from "@ops/shared/store"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { useLogout } from "../hooks/useAuth"
import Header from "./Header"

jest.mock("@ops/shared/store")
jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}))
jest.mock("../hooks/useAuth")

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )
}

describe("Header", () => {
  beforeEach(() => {
    ;(useStore.use.user as jest.Mock).mockReturnValue({ name: "Alice Johnson" })
    ;(useLogout as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false })
  })

  it("renders app title", () => {
    renderHeader()
    expect(screen.getByText("Ops Dashboard")).toBeInTheDocument()
  })

  it("renders theme toggle button", () => {
    renderHeader()
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument()
  })

  it("renders user name from store", () => {
    renderHeader()
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
  })

  it("renders logout button when user is present", () => {
    renderHeader()
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument()
  })

  it("calls logout mutation on logout click", async () => {
    const mockMutate = jest.fn()
    ;(useLogout as jest.Mock).mockReturnValue({ mutate: mockMutate, isPending: false })

    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(mockMutate).toHaveBeenCalled()
  })
})
