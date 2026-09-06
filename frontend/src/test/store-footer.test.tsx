import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoreFooter } from "@/components/layout/store-footer";

describe("StoreFooter & Site-Wide Navigation Suite", () => {
  it("1. Brand Identity: renders NeuroCommerce logo, tagline, description, and platform status", () => {
    render(<StoreFooter />);

    expect(screen.getByText("Advanced BCI & Neural Tech")).toBeInTheDocument();
    expect(
      screen.getByText(/Discover advanced technology, intelligent devices, and research equipment/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Technology Platform Online")).toBeInTheDocument();
  });

  it("2. Navigation Groups: renders Shop, Customer Support, and Resources columns with authoritative links", () => {
    render(<StoreFooter />);

    // Shop Navigation
    expect(screen.getByRole("navigation", { name: /shop navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /^all products$/i })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /^shop by category$/i })).toHaveAttribute("href", "/categories");
    expect(screen.getByRole("link", { name: /^trusted brands$/i })).toHaveAttribute("href", "/brands");

    // Customer Support Navigation
    expect(screen.getByRole("navigation", { name: /customer support navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^customer account$/i })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: /^track order$/i })).toHaveAttribute("href", "/account/orders");
    expect(screen.getByRole("link", { name: /^my wishlist$/i })).toHaveAttribute("href", "/account/wishlist");
    expect(screen.getByRole("link", { name: /^shopping cart$/i })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: /^saved addresses$/i })).toHaveAttribute("href", "/account/addresses");

    // Resources Navigation
    expect(screen.getByRole("navigation", { name: /resources navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^technology insights$/i })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /^hardware catalog$/i })).toHaveAttribute("href", "/categories");
  });

  it("3. Security & Trust Row: renders 4 trust pillars with icons", () => {
    render(<StoreFooter />);

    expect(screen.getByText("Secure Payments")).toBeInTheDocument();
    expect(screen.getByText("Verified Products")).toBeInTheDocument();
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
    expect(screen.getByText("24/7 Expert Support")).toBeInTheDocument();
  });

  it("4. Bottom Legal Bar: renders dynamic/standard copyright and legal policy links", () => {
    render(<StoreFooter />);

    expect(screen.getByText(/© 2026 NeuroCommerce\. All rights reserved\./i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /legal navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^privacy notice$/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /^terms of service$/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /^security policy$/i })).toHaveAttribute("href", "/security");
  });

  it("5. Accessibility: verifies semantic footer tag and aria-hidden on decorative SVGs", () => {
    const { container } = render(<StoreFooter />);

    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();

    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });
});
