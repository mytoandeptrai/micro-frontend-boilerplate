import React from "react"
export declare const parseAsString: {
  withDefault: (d: string) => {
    defaultValue: string
  }
}
export declare const parseAsInteger: {
  withDefault: (d: number) => {
    defaultValue: number
  }
}
export declare function useQueryState(
  key: string,
  parser?: {
    defaultValue?: unknown
  },
): readonly [any, (v: any) => void]
export declare function useQueryStates(
  parsers: Record<
    string,
    {
      defaultValue?: unknown
    }
  >,
): readonly [Record<string, any>, (partial: Record<string, any>) => void]
export declare function NuqsAdapter({
  children,
}: {
  children: React.ReactNode
}): React.FunctionComponentElement<React.FragmentProps>
