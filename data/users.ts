// These accounts and the shared password are published on the saucedemo.com login page itself.
export const PASSWORD = process.env.SAUCE_PASSWORD ?? "secret_sauce";

export const users = {
  standard: "standard_user",
  lockedOut: "locked_out_user",
  problem: "problem_user",
  performanceGlitch: "performance_glitch_user",
  error: "error_user",
  visual: "visual_user",
} as const;

export const customer = {
  firstName: "Jan",
  lastName: "Kowalski",
  postalCode: "00-001",
};
