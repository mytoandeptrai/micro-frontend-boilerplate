import React from "react"

export const parseAsString = {
  withDefault: (d: string) => ({ defaultValue: d }),
}
export const parseAsInteger = {
  withDefault: (d: number) => ({ defaultValue: d }),
}

const state: Record<string, unknown> = {}
const setters: Record<string, (v: unknown) => void> = {}

export function useQueryState(
  key: string,
  parser?: { defaultValue?: unknown },
) {
  const defaultValue = parser?.defaultValue ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [val, setVal] = React.useState<any>(state[key] ?? defaultValue)
  setters[key] = setVal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [
    val,
    (v: any) => {
      state[key] = v
      setVal(v)
    },
  ] as const
}

export function useQueryStates(
  parsers: Record<string, { defaultValue?: unknown }>,
) {
  const entries = Object.entries(parsers)
  const initState = Object.fromEntries(
    entries.map(([k, p]) => [k, p?.defaultValue ?? ""]),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vals, setVals] = React.useState<Record<string, any>>(initState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setter = (partial: Record<string, any>) =>
    setVals((prev) => ({ ...prev, ...partial }))
  return [vals, setter] as const
}

export function NuqsAdapter({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}
