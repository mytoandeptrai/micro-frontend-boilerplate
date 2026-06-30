import { render, screen } from "@testing-library/react"
import { Users } from "lucide-react"
import { StatsCard } from "./StatsCard"

describe("StatsCard", () => {
  it("renders label and value", () => {
    render(<StatsCard label="Total Members" value={42} />)
    expect(screen.getByText("Total Members")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders loading state when value is undefined", () => {
    render(<StatsCard label="Active Members" value={undefined} />)
    expect(screen.getByText("Active Members")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("renders optional icon", () => {
    render(<StatsCard label="Admins" value={3} icon={Users} />)
    expect(screen.getByText("Admins")).toBeInTheDocument()
  })
})
