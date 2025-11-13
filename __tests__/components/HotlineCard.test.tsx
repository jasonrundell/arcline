import { render, screen } from "@testing-library/react";
import HotlineCard from "@/components/HotlineCard";

describe("HotlineCard", () => {
  const mockProps = {
    id: "test",
    title: "Test Hotline",
    description: "Test description",
    icon: "🚁",
    color: "arc-orange",
    href: "/hotline/test",
  };

  it("renders the hotline card with correct content", () => {
    render(<HotlineCard {...mockProps} />);
    
    expect(screen.getByText("Test Hotline")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("🚁")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<HotlineCard {...mockProps} />);
    
    const link = screen.getByLabelText("Access Test Hotline");
    expect(link).toHaveAttribute("href", "/hotline/test");
  });

  it("displays the access hotline text", () => {
    render(<HotlineCard {...mockProps} />);
    
    expect(screen.getByText(/Access Hotline/)).toBeInTheDocument();
  });
});

