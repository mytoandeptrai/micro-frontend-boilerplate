import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@ops/ui/components/button"
import {
  Form,
  FormControl,
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
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSettings } from "../hooks/useSettings"
import { useUpdateSettings } from "../hooks/useUpdateSettings"

const timezones = Intl.supportedValuesOf("timeZone")

const schema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  timezone: z.string().min(1, "Timezone is required"),
})

type FormValues = z.infer<typeof schema>

export default function GeneralSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: settings
      ? { workspaceName: settings.workspaceName, timezone: settings.timezone }
      : undefined,
  })

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync(values)
  }

  return (
    <div className="max-w-lg space-y-6 p-6">
      <h1 className="font-heading text-sm font-semibold">General</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="workspaceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
