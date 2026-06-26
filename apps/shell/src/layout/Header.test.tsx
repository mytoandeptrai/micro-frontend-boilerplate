import { render, screen } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it("renders app title", () => {
    render(<Header />);
    expect(screen.getByText("Ops Dashboard")).toBeInTheDocument();
  });

  it("renders user placeholder", () => {
    render(<Header />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });
});
