import { describe, it, expect } from "vitest";
import { apiClient } from "@/lib/api/client";

describe("API Client Foundation", () => {
  it("is configured with JSON accept and content-type headers", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
    expect(apiClient.defaults.headers["Accept"]).toBe("application/json");
  });

  it("has a valid base URL configured", () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.baseURL).toContain("/api/v1");
  });

  it("has reasonable request timeout configured", () => {
    expect(apiClient.defaults.timeout).toBe(30000);
  });
});
