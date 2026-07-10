import { render } from "@testing-library/react"
import { axe } from "jest-axe"
import { Input } from "./input"

describe("Input", () => {
  it("has no accessibility violations when given an accessible name", async () => {
    const { container } = render(<Input aria-label="Task title" placeholder="Add a task" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
