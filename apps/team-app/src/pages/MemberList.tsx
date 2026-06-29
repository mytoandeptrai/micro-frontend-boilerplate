import { Badge } from "@ops/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ops/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ops/ui/components/table"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import type React from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "shell/store"
import { useDeleteMember } from "../hooks/useMemberMutations"
import { useMembers } from "../hooks/useMembers"
import type { MemberRole, MemberStatus } from "../types"

const roleOptions: { value: MemberRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
]

const statusOptions: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export default function MemberList() {
  const navigate = useNavigate()
  const user = useStore.use.user()
  const role = user?.role
  const deleteMutation = useDeleteMember()

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    name: parseAsString.withDefault(""),
    role: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
  })

  const { data, isLoading } = useMembers({
    page: params.page,
    name: params.name || undefined,
    role: (params.role as MemberRole) || undefined,
    status: (params.status as MemberStatus) || undefined,
  })

  const members = data?.data ?? []
  const meta = data?.meta

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (confirm("Delete this member?")) deleteMutation.mutate(id)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search name..."
            value={params.name}
            onChange={(e) => setParams({ name: e.target.value, page: 1 })}
            className="h-8 border border-border bg-background px-3 text-sm focus:outline-none focus:border-ring"
          />
          <Select
            value={params.role || "all"}
            onValueChange={(v) =>
              setParams({ role: v === "all" ? "" : v, page: 1 })
            }
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={params.status || "all"}
            onValueChange={(v) =>
              setParams({ status: v === "all" ? "" : v, page: 1 })
            }
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "admin" && (
          <button
            type="button"
            onClick={() => navigate("/team/create")}
            className="h-8 px-4 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
          >
            Create Member
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {role !== "viewer" && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => navigate(`/team/${m.id}`)}
              >
                <TableCell>
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="size-8 rounded-full"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs">
                      {m.name[0]}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {m.email}
                </TableCell>
                <TableCell>
                  <Badge variant={m.role === "admin" ? "default" : "outline"}>
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.status === "active" ? "default" : "secondary"}
                  >
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(m.createdAt).toLocaleDateString()}
                </TableCell>
                {role !== "viewer" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/team/${m.id}`)
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={(e) => handleDelete(e, m.id)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={role !== "viewer" ? 7 : 6}
                  className="text-center text-muted-foreground py-8"
                >
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={params.page <= 1}
            onClick={() => setParams({ page: params.page - 1 })}
            className="px-3 h-8 border border-border disabled:opacity-40 hover:bg-muted"
          >
            Prev
          </button>
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <button
            type="button"
            disabled={params.page >= meta.totalPages}
            onClick={() => setParams({ page: params.page + 1 })}
            className="px-3 h-8 border border-border disabled:opacity-40 hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
