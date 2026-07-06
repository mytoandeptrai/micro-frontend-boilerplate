import { publishEvent } from "@ops/shared-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { useStore } from "shell/store"
import TaskList from "./TaskList"

jest.mock("shell/store")
jest.mock("@ops/shared-core", () => ({
  ...jest.requireActual("@ops/shared-core"),
  publishEvent: jest.fn(),
}))

function renderTaskList() {
  return render(
    <NuqsTestingAdapter>
      <TaskList />
    </NuqsTestingAdapter>,
  )
}

describe("TaskList", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStore.use.user as jest.Mock).mockReturnValue({ name: "Alice" })
  })

  it("adds a task and publishes task:added", async () => {
    const user = userEvent.setup()
    renderTaskList()

    await user.type(screen.getByPlaceholderText("Add a task"), "Buy milk")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(screen.getByText("Buy milk")).toBeInTheDocument()
    expect(publishEvent).toHaveBeenCalledWith(
      "task:added",
      expect.objectContaining({
        task: expect.objectContaining({ title: "Buy milk", completed: false }),
        sourceInstanceId: "first-app",
      }),
    )
  })

  it("filters tasks by active/completed", async () => {
    const user = userEvent.setup()
    renderTaskList()

    await user.type(screen.getByPlaceholderText("Add a task"), "Task A")
    await user.click(screen.getByRole("button", { name: "Add" }))
    await user.type(screen.getByPlaceholderText("Add a task"), "Task B")
    await user.click(screen.getByRole("button", { name: "Add" }))

    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await user.click(screen.getByRole("button", { name: "active" }))
    expect(screen.queryByText("Task A")).not.toBeInTheDocument()
    expect(screen.getByText("Task B")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "completed" }))
    expect(screen.getByText("Task A")).toBeInTheDocument()
    expect(screen.queryByText("Task B")).not.toBeInTheDocument()
  })

  it("toggles complete and publishes task:completed", async () => {
    const user = userEvent.setup()
    renderTaskList()

    await user.type(screen.getByPlaceholderText("Add a task"), "Buy milk")
    await user.click(screen.getByRole("button", { name: "Add" }))
    await user.click(screen.getByRole("checkbox"))

    expect(publishEvent).toHaveBeenCalledWith(
      "task:completed",
      expect.objectContaining({ completed: true, sourceInstanceId: "first-app" }),
    )
  })

  it("deletes a task and publishes task:removed", async () => {
    const user = userEvent.setup()
    renderTaskList()

    await user.type(screen.getByPlaceholderText("Add a task"), "Buy milk")
    await user.click(screen.getByRole("button", { name: "Add" }))
    await user.click(screen.getByRole("button", { name: "Delete" }))

    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument()
    expect(publishEvent).toHaveBeenCalledWith(
      "task:removed",
      expect.objectContaining({ sourceInstanceId: "first-app" }),
    )
  })
})
