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
  it("renders 3 nav links", () => {
    renderWithRouter()
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Tasks" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Stats" })).toBeInTheDocument()
  })

  it("highlights active route for /tasks", () => {
    renderWithRouter("/tasks")
    const tasksLink = screen.getByRole("link", { name: "Tasks" })
    expect(tasksLink.className).toContain("bg-primary")
  })

  it("highlights active route for /", () => {
    renderWithRouter("/")
    const homeLink = screen.getByRole("link", { name: "Home" })
    expect(homeLink.className).toContain("bg-primary")
  })
})
