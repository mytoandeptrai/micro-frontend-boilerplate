import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@ops/ui/components/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ops/ui/components/form"
import { Input } from "@ops/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ops/ui/components/select"
import { Textarea } from "@ops/ui/components/textarea"

import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  validateDeadlineNotInPast,
  validateHighPriorityHasDeadline,
} from "../../lib/businessRules"
import ProjectSelect from "./ProjectSelect"
import TagSelect from "./TagSelect"

const taskFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(TASK_TITLE_MAX_LENGTH, `Title must be at most ${TASK_TITLE_MAX_LENGTH} characters`),
    description: z
      .string()
      .max(
        TASK_DESCRIPTION_MAX_LENGTH,
        `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters`,
      ),
    priority: z.enum(["low", "medium", "high"]),
    projectId: z.string(),
    tagIds: z.array(z.string()),
    deadline: z.string(),
  })
  .superRefine((values, ctx) => {
    const deadline = values.deadline || null

    const deadlineCheck = validateDeadlineNotInPast(deadline)
    if (!deadlineCheck.valid) {
      ctx.addIssue({
        code: "custom",
        path: ["deadline"],
        message: deadlineCheck.error ?? "Invalid deadline",
      })
    }

    const priorityCheck = validateHighPriorityHasDeadline(values.priority, deadline)
    if (!priorityCheck.valid) {
      ctx.addIssue({
        code: "custom",
        path: ["deadline"],
        message: priorityCheck.error ?? "Invalid priority",
      })
    }
  })

export type TaskFormValues = z.infer<typeof taskFormSchema>

const EMPTY_DEFAULTS: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  projectId: "",
  tagIds: [],
  deadline: "",
}

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => void
  isSubmitting: boolean
  submitLabel: string
}

export default function TaskForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What needs to be done?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Required for high priority tasks.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <ProjectSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
