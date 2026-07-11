import TaskDetailDrawer from "../components/task/TaskDetailDrawer"
import TaskList from "../components/task/TaskList"
import TaskStatistics from "../components/task/TaskStatistics"
import TaskToolbar from "../components/task/TaskToolbar"
import UndoDeleteNotification from "../components/task/UndoDeleteNotification"

export default function TaskManagementPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Task Management</h1>
        <p className="text-xs text-muted-foreground">
          Track, filter, and organize your personal tasks.
        </p>
      </div>

      <TaskStatistics />
      <TaskToolbar />
      <TaskList />

      <TaskDetailDrawer />
      <UndoDeleteNotification />
    </div>
  )
}
