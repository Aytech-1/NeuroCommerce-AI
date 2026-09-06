import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils";

describe("Centralized Currency Formatter (formatCurrency)", () => {
  it("formats standard amounts using NGN default currency and ₦ symbol", () => {
    const formatted = formatCurrency(1500);
    expect(formatted).toBe("₦1,500.00");
  });

  it("formats zero amount accurately with two decimal places", () => {
    const formatted = formatCurrency(0);
    expect(formatted).toBe("₦0.00");
  });

  it("formats large enterprise amounts with proper thousand separators", () => {
    const formatted = formatCurrency(2500000);
    expect(formatted).toBe("₦2,500,000.00");
  });

  it("supports explicit non-default currencies when provided", () => {
    const formattedUsd = formatCurrency(100, "USD");
    expect(formattedUsd).toBe("$100.00");

    const formattedEur = formatCurrency(50, "EUR");
    expect(formattedEur).toContain("50.00");
    expect(formattedEur).toMatch(/€|EUR/);
  });
});
