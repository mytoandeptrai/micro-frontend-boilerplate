import { publishEvent } from "@ops/shared"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as useSettingsHook from "../hooks/useSettings"
import * as mutations from "../hooks/useUpdateSettings"
import ThemeSettings from "./ThemeSettings"

jest.mock("../hooks/useSettings")
jest.mock("../hooks/useUpdateSettings")
jest.mock("@ops/shared", () => ({ publishEvent: jest.fn() }))

const mockSettings = {
  id: "uuid-1",
  workspaceName: "Ops Dashboard",
  timezone: "Asia/Ho_Chi_Minh",
  theme: "dark" as const,
  inAppNotifications: true,
  memberJoinAlert: true,
  updatedAt: "2024-01-01T00:00:00.000Z",
}

const mockUpdateMutation = {
  mutate: jest.fn(),
  isPending: false,
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  ;(useSettingsHook.useSettings as jest.Mock).mockReturnValue({
    data: mockSettings,
    isLoading: false,
  })
  ;(mutations.useUpdateSettings as jest.Mock).mockReturnValue(
    mockUpdateMutation,
  )

  return render(
    <QueryClientProvider client={qc}>
      <ThemeSettings />
    </QueryClientProvider>,
  )
}

describe("ThemeSettings", () => {
  it("clicking Light publishes theme:change and patches settings", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText("Light"))

    expect(publishEvent).toHaveBeenCalledWith("theme:change", {
      theme: "light",
    })
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ theme: "light" })
  })
})
