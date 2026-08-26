import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpertCTA } from "@/components/store/expert-cta";

describe("Expert Consultation & Newsletter CTA Suite", () => {
  it("1. Section Header & Copy: renders eyebrow, H2 heading, and consultation copy", () => {
    render(<ExpertCTA />);

    // Accessible landmark
    expect(
      screen.getByRole("region", { name: /not sure which technology is right for you\?/i })
    ).toBeInTheDocument();

    // Eyebrow and Headings
    expect(screen.getByText("EXPERT GUIDANCE")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /not sure which technology is right for you\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Get personalized guidance from our team and discover the products/i)
    ).toBeInTheDocument();
  });

  it("2. Consultation CTAs: renders Talk to an Expert and Explore Catalog links", () => {
    render(<ExpertCTA />);

    const expertLink = screen.getByRole("link", { name: /talk to an expert/i });
    expect(expertLink).toBeInTheDocument();
    expect(expertLink).toHaveAttribute("href", "/products");

    const catalogLink = screen.getByRole("link", { name: /explore catalog/i });
    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveAttribute("href", "/products");
  });

  it("3. Newsletter Section: renders H3 heading, explicit label, input, and honest status", () => {
    render(<ExpertCTA />);

    // Heading 3
    expect(
      screen.getByRole("heading", { level: 3, name: /stay ahead of what's next\./i })
    ).toBeInTheDocument();

    // Form label & input
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    expect(emailInput).toBeDisabled();

    // Subscribe button
    const subscribeBtn = screen.getByRole("button", { name: /subscribe/i });
    expect(subscribeBtn).toBeDisabled();

    // Honest reassurance note
    expect(
      screen.getByText(/newsletter subscription service coming soon\./i)
    ).toBeInTheDocument();
  });

  it("4. Accessibility: ensures icons have aria-hidden and inputs have proper IDs", () => {
    const { container } = render(<ExpertCTA />);

    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("id", "newsletter-email");
  });
});
