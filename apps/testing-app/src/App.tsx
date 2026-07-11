import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import { Navigate, Route, Routes } from "react-router-dom"

import { TaskConfigProvider } from "./context/TaskConfigContext"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import TaskManagementPage from "./pages/TaskManagementPage"
import ProtectedRoute from "./routes/ProtectedRoute"

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            index
            element={
              <TaskConfigProvider>
                <TaskManagementPage />
              </TaskConfigProvider>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
