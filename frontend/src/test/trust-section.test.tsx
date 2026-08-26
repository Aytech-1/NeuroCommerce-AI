import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustSection } from "@/components/store/trust-section";

describe("Trust & Why NeuroCommerce Suite", () => {
  it("1. Section Header: renders eyebrow, H2 heading, and supporting copy", () => {
    render(<TrustSection />);

    // Accessible landmark
    expect(screen.getByRole("region", { name: /technology you can trust/i })).toBeInTheDocument();

    // Eyebrow and Headings
    expect(screen.getByText("WHY NEUROCOMMERCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /technology you can trust/i })).toBeInTheDocument();
    expect(
      screen.getByText(/From verified products to secure checkout and expert support/i)
    ).toBeInTheDocument();
  });

  it("2. Trust Cards: renders all 4 trust pillars with authoritative titles and descriptions", () => {
    render(<TrustSection />);

    // Card 1: Secure Payments
    expect(screen.getByRole("heading", { level: 3, name: /secure payments/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Your payment information is protected with secure, industry-standard payment processing/i)
    ).toBeInTheDocument();

    // Card 2: Verified Products
    expect(screen.getByRole("heading", { level: 3, name: /verified products/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Shop confidently with carefully selected products from trusted manufacturers and brands/i)
    ).toBeInTheDocument();

    // Card 3: Fast & Reliable Delivery
    expect(screen.getByRole("heading", { level: 3, name: /fast & reliable delivery/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Get your technology delivered safely with dependable shipping and real-time order tracking/i)
    ).toBeInTheDocument();

    // Card 4: Expert Support
    expect(screen.getByRole("heading", { level: 3, name: /expert support/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Our support team is available to help before, during, and after your purchase/i)
    ).toBeInTheDocument();
  });

  it("3. Accessibility & Layout: checks presence of icons and 4 distinct card containers", () => {
    const { container } = render(<TrustSection />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.length).toBe(4);

    // All SVGs should be marked aria-hidden for clean screen-reader output
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(4);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });
});
