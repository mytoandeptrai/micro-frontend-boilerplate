export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-sm font-semibold">Ops Dashboard</span>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          U
        </div>
        <span className="text-sm text-muted-foreground">User</span>
      </div>
    </header>
  )
}
