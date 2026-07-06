import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import { Route, Routes } from "react-router-dom"

// Replace with your actual pages
const PlaceholderPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">baseApp</h1>
    <p className="text-muted-foreground">Start building your feature here.</p>
  </div>
)

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route index element={<PlaceholderPage />} />
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
