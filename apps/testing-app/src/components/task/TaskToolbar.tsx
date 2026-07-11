import { Button } from "@ops/ui/components/button"

import TaskFormModal from "./TaskFormModal"
import TaskPriorityFilter from "./TaskPriorityFilter"
import TaskSearchInput from "./TaskSearchInput"
import TaskSortSelect from "./TaskSortSelect"
import TaskStatusFilter from "./TaskStatusFilter"

export default function TaskToolbar() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TaskSearchInput />
        <TaskSortSelect />
        <TaskFormModal mode="create" trigger={<Button type="button">+ New Task</Button>} />
      </div>
      <TaskStatusFilter />
      <TaskPriorityFilter />
    </div>
  )
}
