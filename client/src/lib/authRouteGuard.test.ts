import { describe, expect, it } from "vitest";
import { getAuthRedirect } from "./authRouteGuard";

describe("getAuthRedirect", () => {
  it("sends an authenticated visitor from the root to the dashboard", () => {
    expect(getAuthRedirect("/", true)).toBe("/dashboard");
  });

  it("sends an authenticated visitor away from the login page", () => {
    expect(getAuthRedirect("/login", true)).toBe("/dashboard");
  });

  it("protects dashboard subroutes from unauthenticated visitors", () => {
    expect(getAuthRedirect("/dashboard/settings", false)).toBe("/login");
  });

  it("protects internal views from unauthenticated visitors", () => {
    expect(getAuthRedirect("/inventory", false)).toBe("/login");
  });

  it("allows public routes and authenticated internal views", () => {
    expect(getAuthRedirect("/register", false)).toBeNull();
    expect(getAuthRedirect("/dashboard", true)).toBeNull();
    expect(getAuthRedirect("/inventory", true)).toBeNull();
  });
});
