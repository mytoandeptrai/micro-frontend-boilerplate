import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as useSettingsHook from "../hooks/useSettings"
import * as mutations from "../hooks/useUpdateSettings"
import NotificationSettings from "./NotificationSettings"

jest.mock("../hooks/useSettings")
jest.mock("../hooks/useUpdateSettings")
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

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
  mutateAsync: jest.fn().mockResolvedValue(mockSettings),
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
      <NotificationSettings />
    </QueryClientProvider>,
  )
}

describe("NotificationSettings", () => {
  it("toggling memberJoinAlert off and submitting sends the updated value", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText("Alert when a member joins"))
    await user.click(screen.getByText("Save"))

    await waitFor(() => {
      expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          memberJoinAlert: false,
          inAppNotifications: true,
        }),
      )
    })
  })
})
