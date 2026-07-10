import { render } from "@testing-library/react"
import { axe } from "jest-axe"
import { Button } from "./button"

describe("Button", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Click me</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
