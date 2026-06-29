declare module "*.css" {
  const content: string
  export default content
}

declare module "shell/store" {
  import type { GlobalState } from "@ops/shared/store"
  import type { StoreApi, UseBoundStore } from "zustand"

  type UseStore = UseBoundStore<StoreApi<GlobalState>> & {
    use: { [K in keyof GlobalState]: () => GlobalState[K] }
  }

  export const useStore: UseStore
}
