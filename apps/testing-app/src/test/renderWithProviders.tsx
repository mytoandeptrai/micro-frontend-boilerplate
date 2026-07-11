import type { QueryClient, QueryKey } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderResult } from "@testing-library/react"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import type { ReactElement, ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"

import { Toaster } from "@ops/ui/components/sonner"

import { TaskConfigProvider, type TaskConfigProviderProps } from "../context/TaskConfigContext"
import { createTestQueryClient } from "./createTestQueryClient"

export interface InitialQueryData {
  queryKey: QueryKey
  data: unknown
}

export interface RenderWithProvidersOptions {
  queryClient?: QueryClient
  route?: string
  searchParams?: string | Record<string, string>
  initialQueryData?: InitialQueryData[]
  taskConfig?: Pick<TaskConfigProviderProps, "defaultTaskConfig" | "permissions">
}

export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient
}

/**
 * Renders a component wrapped with the same providers the real app uses:
 * QueryClientProvider, MemoryRouter, NuqsTestingAdapter (for filter/search
 * state) and TaskConfigProvider. `hasMemory` is on by default so nuqs
 * setters (e.g. clicking a status filter) actually update state visible to
 * re-renders, matching real browser behavior.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  const queryClient = options.queryClient ?? createTestQueryClient()

  for (const { queryKey, data } of options.initialQueryData ?? []) {
    queryClient.setQueryData(queryKey, data)
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[options.route ?? "/"]}>
          <NuqsTestingAdapter searchParams={options.searchParams} hasMemory>
            <TaskConfigProvider
              defaultTaskConfig={options.taskConfig?.defaultTaskConfig}
              permissions={options.taskConfig?.permissions}
            >
              {children}
              <Toaster />
            </TaskConfigProvider>
          </NuqsTestingAdapter>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  const result = render(ui, { wrapper: Wrapper })

  return { ...result, queryClient }
}
