import { useStore } from "@ops/shared-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NameModal from "./NameModal"

jest.mock("@ops/shared-core")

describe("NameModal", () => {
  it("shows when user is null", () => {
    ;(useStore.use.user as jest.Mock).mockReturnValue(null)
    ;(useStore.use.setUser as jest.Mock).mockReturnValue(jest.fn())
    render(<NameModal />)
    expect(screen.getByText("Welcome to Task Board")).toBeInTheDocument()
  })

  it("does not show when user is already set", () => {
    ;(useStore.use.user as jest.Mock).mockReturnValue({ name: "Alice" })
    ;(useStore.use.setUser as jest.Mock).mockReturnValue(jest.fn())
    render(<NameModal />)
    expect(screen.queryByText("Welcome to Task Board")).not.toBeInTheDocument()
  })

  it("submits name and calls setUser", async () => {
    const setUser = jest.fn()
    ;(useStore.use.user as jest.Mock).mockReturnValue(null)
    ;(useStore.use.setUser as jest.Mock).mockReturnValue(setUser)

    const user = userEvent.setup()
    render(<NameModal />)
    await user.type(screen.getByPlaceholderText("Your name"), "Alice")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(setUser).toHaveBeenCalledWith({ name: "Alice" })
  })
})
