import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { EventDebugger } from "./EventDebugger"

describe("EventDebugger", () => {
  it("has no accessibility violations when collapsed", async () => {
    const { container } = render(<EventDebugger />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("has no accessibility violations when expanded (sheet content)", async () => {
    const { container } = render(<EventDebugger />)
    await userEvent.click(screen.getByRole("button", { name: /events/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
