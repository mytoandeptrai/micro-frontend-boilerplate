import { createSelectorFunctions } from "auto-zustand-selectors-hook"
import { create } from "zustand"
import type { Member } from "./types"

export interface GlobalState {
  user: Member | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: Member | null) => void
  setAuthenticated: (v: boolean) => void
  setLoading: (v: boolean) => void
}

const useBaseStore = create<GlobalState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export const useStore = createSelectorFunctions(useBaseStore)
