import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Sidebar from "./Sidebar"

function renderWithRouter(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe("Sidebar", () => {
  it("renders 4 nav links", () => {
    renderWithRouter()
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Team" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Monitor" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument()
  })

  it("highlights active route for /team", () => {
    renderWithRouter("/team")
    const teamLink = screen.getByRole("link", { name: "Team" })
    expect(teamLink.className).toContain("bg-primary")
  })

  it("highlights active route for /", () => {
    renderWithRouter("/")
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" })
    expect(dashboardLink.className).toContain("bg-primary")
  })
})
