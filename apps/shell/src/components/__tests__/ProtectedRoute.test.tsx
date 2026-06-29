import { useStore } from "@ops/shared/store"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProtectedRoute from "../ProtectedRoute"

jest.mock("@ops/shared/store")

function renderInRouter(ui: React.ReactElement, initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {
  it("shows spinner when isLoading=true", () => {
    ;(useStore.use.isLoading as jest.Mock).mockReturnValue(true)
    ;(useStore.use.isAuthenticated as jest.Mock).mockReturnValue(false)

    const { container } = renderInRouter(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    )

    expect(screen.queryByText("Protected")).not.toBeInTheDocument()
    expect(container.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("redirects to /login when not authenticated", () => {
    ;(useStore.use.isLoading as jest.Mock).mockReturnValue(false)
    ;(useStore.use.isAuthenticated as jest.Mock).mockReturnValue(false)

    renderInRouter(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
      "/team",
    )

    expect(screen.queryByText("Protected")).not.toBeInTheDocument()
    expect(screen.getByText("Login Page")).toBeInTheDocument()
  })

  it("renders children when authenticated", () => {
    ;(useStore.use.isLoading as jest.Mock).mockReturnValue(false)
    ;(useStore.use.isAuthenticated as jest.Mock).mockReturnValue(true)

    renderInRouter(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText("Protected")).toBeInTheDocument()
  })
})
