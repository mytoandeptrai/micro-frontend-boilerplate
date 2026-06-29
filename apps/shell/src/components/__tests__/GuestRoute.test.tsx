import { useStore } from "@ops/shared/store"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import GuestRoute from "../GuestRoute"

jest.mock("@ops/shared/store")

describe("GuestRoute", () => {
  it("redirects to / when authenticated", () => {
    ;(useStore.use.isAuthenticated as jest.Mock).mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <GuestRoute><div>Login</div></GuestRoute>
      </MemoryRouter>,
    )

    expect(screen.queryByText("Login")).not.toBeInTheDocument()
  })

  it("renders children when not authenticated", () => {
    ;(useStore.use.isAuthenticated as jest.Mock).mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <GuestRoute><div>Login</div></GuestRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText("Login")).toBeInTheDocument()
  })
})
