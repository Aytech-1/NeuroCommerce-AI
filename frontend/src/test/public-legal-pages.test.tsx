import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivacyNoticePage from "@/app/(store)/privacy/page";
import TermsOfServicePage from "@/app/(store)/terms/page";
import SecurityPolicyPage from "@/app/(store)/security/page";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Storefront Public Legal & Information Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Privacy Notice Page (/privacy)", () => {
    it("renders page with exactly one H1 header", () => {
      renderWithQuery(<PrivacyNoticePage />);
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/^Privacy Notice$/i);
    });

    it("renders semantic breadcrumb navigation pointing to Home and Privacy Notice", () => {
      renderWithQuery(<PrivacyNoticePage />);
      const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
      expect(screen.getByText(/^privacy notice$/i, { selector: "[aria-current='page']" })).toBeInTheDocument();
    });

    it("renders authoritative privacy policy content sections and contact email", () => {
      renderWithQuery(<PrivacyNoticePage />);
      expect(screen.getByRole("heading", { level: 2, name: /1\. Information We Collect/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /2\. How We Use Information/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /3\. Information Sharing & Disclosure/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /4\. Data Security & Storage/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /5\. Your Privacy Rights/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /6\. Contact Information/i })).toBeInTheDocument();
      expect(screen.getByText(/privacy@neurocommerce\.ai/i)).toBeInTheDocument();
    });

    it("renders table of contents navigation on desktop", () => {
      renderWithQuery(<PrivacyNoticePage />);
      expect(screen.getByRole("navigation", { name: /table of contents/i })).toBeInTheDocument();
    });
  });

  describe("2. Terms of Service Page (/terms)", () => {
    it("renders page with exactly one H1 header", () => {
      renderWithQuery(<TermsOfServicePage />);
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/^Terms of Service$/i);
    });

    it("renders semantic breadcrumb navigation pointing to Home and Terms of Service", () => {
      renderWithQuery(<TermsOfServicePage />);
      const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
      expect(screen.getByText(/^terms of service$/i, { selector: "[aria-current='page']" })).toBeInTheDocument();
    });

    it("renders authoritative terms of service content sections and legal inquiries email", () => {
      renderWithQuery(<TermsOfServicePage />);
      expect(screen.getByRole("heading", { level: 2, name: /1\. Agreement to Terms/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /2\. Account Responsibilities/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /3\. Product Orders & Pricing/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /4\. Payment & Billing/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /5\. Shipping & Delivery/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /6\. Returns & Refunds/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /7\. Intellectual Property/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /8\. Limitation of Liability/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /9\. Contact & Inquiries/i })).toBeInTheDocument();
      expect(screen.getByText(/legal@neurocommerce\.ai/i)).toBeInTheDocument();
    });
  });

  describe("3. Security Policy Page (/security)", () => {
    it("renders page with exactly one H1 header", () => {
      render(<SecurityPolicyPage />);
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/^Security Policy$/i);
    });

    it("renders semantic breadcrumb navigation pointing to Home and Security Policy", () => {
      render(<SecurityPolicyPage />);
      const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
      expect(screen.getByText(/^security policy$/i, { selector: "[aria-current='page']" })).toBeInTheDocument();
    });

    it("renders verified platform security pillars and responsible disclosure reporting", () => {
      render(<SecurityPolicyPage />);
      expect(screen.getByRole("heading", { level: 2, name: /1\. Authenticated Access & Session Management/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /2\. Role-Based Access Control/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /3\. API Integrity & Data Validation/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /4\. Immutable Audit Trails & Logging/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /5\. Encryption in Transit/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /6\. Rate Limiting & Abuse Prevention/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: /7\. Responsible Disclosure/i })).toBeInTheDocument();
      expect(screen.getByText(/security@neurocommerce\.ai/i)).toBeInTheDocument();
    });
  });
});
