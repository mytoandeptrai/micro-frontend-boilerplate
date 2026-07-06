import { EventDebugger } from "@ops/ui/devtools"
import React, { Suspense } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import NameModal from "./components/NameModal"
import Header from "./layout/Header"
import Sidebar from "./layout/Sidebar"
import WelcomePage from "./pages/WelcomePage"

const FirstApp = React.lazy(() => import("firstApp/App"))
const SecondApp = React.lazy(() => import("secondApp/App"))

// FirstApp and SecondApp stay mounted once visited (hidden via CSS instead of
// unmounted by the router) so their useEventSubscription listeners keep receiving
// task events fired from the other app, even while not the active route.
function RemoteOutlet() {
  const location = useLocation()
  const isTasks = location.pathname.startsWith("/tasks")
  const isStats = location.pathname.startsWith("/stats")

  return (
    <>
      {location.pathname === "/" && <WelcomePage />}
      <div hidden={!isTasks}>
        <FirstApp />
      </div>
      <div hidden={!isStats}>
        <SecondApp />
      </div>
    </>
  )
}

function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<div className="p-6">Loading…</div>}>
            <RemoteOutlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NameModal />
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/tasks/*" element={<AppLayout />} />
        <Route path="/stats/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {import.meta.env.DEV && <EventDebugger />}
    </BrowserRouter>
  )
}
