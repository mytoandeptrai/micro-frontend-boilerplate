import { render } from "@testing-library/react"
import { axe } from "jest-axe"
import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  it("has no accessibility violations when given an accessible name", async () => {
    const { container } = render(<Checkbox aria-label="Mark task as done" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
