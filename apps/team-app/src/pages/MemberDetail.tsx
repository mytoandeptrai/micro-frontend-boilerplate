import { Badge } from "@ops/ui/components/badge"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { useStore } from "shell/store"
import { z } from "zod"
import { useMember } from "../hooks/useMember"
import { useDeleteMember, useUpdateMember } from "../hooks/useMemberMutations"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member", "viewer"]),
  avatar: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore.use.user()
  const viewerRole = user?.role === "viewer"
  const { data: member, isLoading } = useMember(id)
  const updateMutation = useUpdateMember(id!)
  const deleteMutation = useDeleteMember()
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    if (!id || !confirm("Delete this member?")) return
    await deleteMutation.mutateAsync(id)
    navigate("/team")
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: member
      ? {
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar ?? "",
        }
      : undefined,
  })

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (!member)
    return <div className="p-6 text-sm text-destructive">Member not found</div>

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync({
      ...values,
      avatar: values.avatar || undefined,
    })
    setIsEditing(false)
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/team")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <h1 className="font-heading font-semibold text-sm">Member Detail</h1>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="size-16 rounded-full"
              />
            ) : (
              <div className="size-16 rounded-full bg-muted flex items-center justify-center text-lg">
                {member.name[0]}
              </div>
            )}
            <div className="space-y-1">
              <div className="font-heading font-semibold">{member.name}</div>
              <div className="text-sm text-muted-foreground">
                {member.email}
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={member.role === "admin" ? "default" : "outline"}
                >
                  {member.role}
                </Badge>
                <Badge
                  variant={member.status === "active" ? "default" : "secondary"}
                >
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Created: {new Date(member.createdAt).toLocaleString()}
          </div>
          <div className="flex gap-2">
            {!viewerRole && (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
            {!viewerRole && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
