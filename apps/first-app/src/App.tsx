import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import { Route, Routes } from "react-router-dom"
import TaskList from "./pages/TaskList"

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route index element={<TaskList />} />
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
