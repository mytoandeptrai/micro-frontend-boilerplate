import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ops/ui/components/select"

import { useProjects } from "../../hooks/useProjects"

const NONE_VALUE = "__none__"

interface ProjectSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const { data: projects, isLoading } = useProjects()

  return (
    <Select
      value={value || NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? "" : next)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading projects…" : "No project"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No project</SelectItem>
        {(projects ?? []).map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
