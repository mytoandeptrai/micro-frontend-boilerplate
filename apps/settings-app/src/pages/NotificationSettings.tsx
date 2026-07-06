import { Button } from "@ops/ui/components/button"
import { Checkbox } from "@ops/ui/components/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@ops/ui/components/form"
import { useForm } from "react-hook-form"
import { useSettings } from "../hooks/useSettings"
import { useUpdateSettings } from "../hooks/useUpdateSettings"

interface FormValues {
  inAppNotifications: boolean
  memberJoinAlert: boolean
}

export default function NotificationSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const form = useForm<FormValues>({
    values: settings
      ? {
          inAppNotifications: settings.inAppNotifications,
          memberJoinAlert: settings.memberJoinAlert,
        }
      : undefined,
  })

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync(values)
  }

  return (
    <div className="max-w-lg space-y-6 p-6">
      <h1 className="font-heading text-sm font-semibold">Notifications</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="inAppNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  In-app notifications
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memberJoinAlert"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Alert when a member joins
                </FormLabel>
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
