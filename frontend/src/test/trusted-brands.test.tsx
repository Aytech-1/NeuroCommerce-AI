import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustedBrands } from "@/components/store/trusted-brands";
import { useBrands } from "@/hooks/use-storefront";
import { BrandItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useBrands: vi.fn(),
}));

const mockBrands: BrandItem[] = [
  {
    id: "brand-1",
    name: "NeuroPulse Dynamics",
    slug: "neuropulse-dynamics",
    description: "Pioneering clinical EEG arrays and neural interfaces for research.",
    website_url: "https://neuropulse.example.com",
    is_active: true,
    products_count: 18,
  },
  {
    id: "brand-2",
    name: "Synaptic Systems",
    slug: "synaptic-systems",
    description: "High-precision telemetry bio-amplifiers and laboratory hardware.",
    website_url: "https://synaptic.example.com",
    is_active: true,
    products_count: 12,
  },
  {
    id: "brand-3",
    name: "CortexLab",
    slug: "cortexlab",
    description: null,
    website_url: null,
    is_active: true,
    products_count: 5,
  },
];

describe("Trusted Brands & Manufacturers Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Section Header: renders eyebrow, H2 heading, subtitle, and View All Brands link", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: mockBrands,
      isLoading: false,
      isError: false,
    } as any);

    render(<TrustedBrands />);

    // Accessible landmark
    expect(screen.getByRole("region", { name: /technology from brands you can trust\./i })).toBeInTheDocument();

    // Eyebrow and Heading
    expect(screen.getByText("TRUSTED MANUFACTURERS")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /technology from brands you can trust\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explore products from established manufacturers and technology brands available through NeuroCommerce\./i)
    ).toBeInTheDocument();

    // View All Brands Link
    const viewAllLinks = screen.getAllByRole("link", { name: /view all brands/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/brands");
  });

  it("2. Brand Cards: renders brand initials, names, descriptions, and correct slug links", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: mockBrands,
      isLoading: false,
      isError: false,
    } as any);

    render(<TrustedBrands />);

    // Brand 1
    expect(screen.getByText("NeuroPulse Dynamics")).toBeInTheDocument();
    expect(screen.getByText("ND")).toBeInTheDocument(); // Initials
    expect(
      screen.getByText("Pioneering clinical EEG arrays and neural interfaces for research.")
    ).toBeInTheDocument();
    expect(screen.getByText("18 Products")).toBeInTheDocument();

    const brand1Link = screen.getByRole("link", { name: /explore neuropulse dynamics products/i });
    expect(brand1Link).toHaveAttribute("href", "/brand/neuropulse-dynamics");

    // Brand 2
    expect(screen.getByText("Synaptic Systems")).toBeInTheDocument();
    expect(screen.getByText("SS")).toBeInTheDocument(); // Initials
    expect(screen.getByText("12 Products")).toBeInTheDocument();

    const brand2Link = screen.getByRole("link", { name: /explore synaptic systems products/i });
    expect(brand2Link).toHaveAttribute("href", "/brand/synaptic-systems");

    // Brand 3 (single word name -> first 2 letters)
    expect(screen.getByText("CortexLab")).toBeInTheDocument();
    expect(screen.getByText("CO")).toBeInTheDocument();
  });

  it("3. Loading State: displays skeletons during fetch", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<TrustedBrands />);
    expect(screen.getByText("Technology From Brands You Can Trust.")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it("4. Error State: renders clean fallback when brands API fails", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<TrustedBrands />);
    expect(screen.getByText("Brand information is temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse products/i })).toHaveAttribute("href", "/products");
  });

  it("5. Empty State: renders friendly message when 0 brands returned", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    render(<TrustedBrands />);
    expect(screen.getByText("Brands Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse catalog/i })).toHaveAttribute("href", "/products");
  });
});
