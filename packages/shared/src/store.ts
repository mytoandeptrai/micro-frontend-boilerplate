import { createSelectorFunctions } from "auto-zustand-selectors-hook"
import { create } from "zustand"
import type { Member, Theme } from "./types"

export interface GlobalState {
  user: Member | null
  isAuthenticated: boolean
  isLoading: boolean
  theme: Theme
  setUser: (user: Member | null) => void
  setAuthenticated: (v: boolean) => void
  setLoading: (v: boolean) => void
  setTheme: (theme: Theme) => void
}

const useBaseStore = create<GlobalState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: "light",
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setTheme: (theme) => set({ theme }),
}))

export const useStore = createSelectorFunctions(useBaseStore)
