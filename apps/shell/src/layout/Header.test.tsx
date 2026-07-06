import { useStore } from "@ops/shared-core"
import { render, screen } from "@testing-library/react"
import { useTheme } from "next-themes"
import { MemoryRouter } from "react-router-dom"
import Header from "./Header"

jest.mock("@ops/shared-core")
jest.mock("next-themes")

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
    ;(useTheme as jest.Mock).mockReturnValue({ resolvedTheme: "dark", setTheme: jest.fn() })
  })

  it("renders app title", () => {
    renderHeader()
    expect(screen.getByText("Task Board")).toBeInTheDocument()
  })

  it("renders user name from store", () => {
    renderHeader()
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
  })

  it("renders theme toggle button", () => {
    renderHeader()
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument()
  })
})
