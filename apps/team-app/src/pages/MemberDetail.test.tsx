import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as useMemberHook from "../hooks/useMember";
import * as mutations from "../hooks/useMemberMutations";
import MemberDetail from "./MemberDetail";

jest.mock("../hooks/useMember");
jest.mock("../hooks/useMemberMutations");
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockMember = {
  id: "uuid-1",
  name: "Alice",
  email: "alice@ops.dev",
  role: "admin" as const,
  status: "active" as const,
  avatar: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockUpdateMutation = { mutateAsync: jest.fn().mockResolvedValue(mockMember), isPending: false };

function renderDetail(id = "uuid-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  (useMemberHook.useMember as jest.Mock).mockReturnValue({ data: mockMember, isLoading: false });
  (mutations.useUpdateMember as jest.Mock).mockReturnValue(mockUpdateMutation);

  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/team/${id}`]}>
        <Routes>
          <Route path="/team/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("MemberDetail", () => {
  it("renders member info in view mode", () => {
    renderDetail();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@ops.dev")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("toggles to edit mode when clicking Edit", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.click(screen.getByText("Edit"));
    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("cancel returns to view mode without API call", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.click(screen.getByText("Edit"));
    await user.click(screen.getByText("Cancel"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(mockUpdateMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("save calls updateMutation with form values", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.click(screen.getByText("Edit"));
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "Alice Updated");
    await user.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice Updated" })
      );
    });
  });
});
