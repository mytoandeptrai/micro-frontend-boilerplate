import { useStore } from "@ops/shared-core"

export default function WelcomePage() {
  const user = useStore.use.user()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome{user ? `, ${user.name}` : ""}</h1>
      <p className="text-muted-foreground">
        Use the sidebar to manage tasks or view stats.
      </p>
    </div>
  )
}
