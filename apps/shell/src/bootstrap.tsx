import "./styles/globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import AuthInitializer from "./components/AuthInitializer"
import ThemeSync from "./components/ThemeSync"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ThemeSync />
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
