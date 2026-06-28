import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import React from "react"
import { Route, Routes } from "react-router-dom"
import MemberDetail from "./pages/MemberDetail"
import MemberList from "./pages/MemberList"

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route index element={<MemberList />} />
        <Route path=":id" element={<MemberDetail />} />
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
