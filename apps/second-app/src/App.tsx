import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import { Route, Routes } from "react-router-dom"
import StatsPanel from "./pages/StatsPanel"

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route index element={<StatsPanel />} />
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
