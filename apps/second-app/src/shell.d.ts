declare module "shell/store" {
  import type { User } from "@ops/shared-core"

  export interface GlobalState {
    user: User | null
    setUser: (user: User | null) => void
  }

  export const useStore: {
    (): GlobalState
    use: {
      user: () => User | null
      setUser: () => GlobalState["setUser"]
    }
  }
}
