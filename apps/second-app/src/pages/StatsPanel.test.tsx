import { publishEvent } from "@ops/shared-core"
import { act, render, screen } from "@testing-library/react"
import { useStore } from "shell/store"
import StatsPanel from "./StatsPanel"

jest.mock("shell/store")

function renderStatsPanel() {
  return render(<StatsPanel />)
}

function getCardValue(label: string) {
  return screen
    .getByText(label)
    .closest('[data-slot="card"]')
    ?.querySelector('[data-slot="card-content"]')?.textContent
}

describe("StatsPanel", () => {
  beforeEach(() => {
    ;(useStore.use.user as jest.Mock).mockReturnValue({ name: "Alice" })
  })

  it("renders 3 stats cards starting at 0", () => {
    renderStatsPanel()
    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
    expect(screen.getByText("Pending")).toBeInTheDocument()
  })

  it("updates total and pending on task:added", () => {
    renderStatsPanel()

    act(() => {
      publishEvent("task:added", {
        task: { id: "1", title: "Buy milk", completed: false, createdAt: new Date() },
        sourceInstanceId: "first-app",
      })
    })

    expect(getCardValue("Total Tasks")).toBe("1")
    expect(getCardValue("Pending")).toBe("1")
    expect(getCardValue("Completed")).toBe("0")
  })

  it("updates completed and pending on task:completed", () => {
    renderStatsPanel()

    act(() => {
      publishEvent("task:added", {
        task: { id: "1", title: "Buy milk", completed: false, createdAt: new Date() },
        sourceInstanceId: "first-app",
      })
    })
    act(() => {
      publishEvent("task:completed", { taskId: "1", completed: true, sourceInstanceId: "first-app" })
    })

    expect(getCardValue("Completed")).toBe("1")
    expect(getCardValue("Pending")).toBe("0")
  })

  it("decrements total on task:removed", () => {
    renderStatsPanel()

    act(() => {
      publishEvent("task:added", {
        task: { id: "1", title: "Buy milk", completed: false, createdAt: new Date() },
        sourceInstanceId: "first-app",
      })
    })
    act(() => {
      publishEvent("task:removed", { taskId: "1", sourceInstanceId: "first-app" })
    })

    expect(getCardValue("Total Tasks")).toBe("0")
    expect(getCardValue("Pending")).toBe("0")
  })
})
