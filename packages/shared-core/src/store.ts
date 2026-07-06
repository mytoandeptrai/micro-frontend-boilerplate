import { createSelectorFunctions } from "auto-zustand-selectors-hook"
import { create } from "zustand"
import type { User } from "./types"

export interface GlobalState {
  user: User | null
  setUser: (user: User | null) => void
}

const useBaseStore = create<GlobalState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export const useStore = createSelectorFunctions(useBaseStore)
