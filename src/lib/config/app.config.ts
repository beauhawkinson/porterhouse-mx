export const app = {
  name: "JP Motorcross",
  description: "Premium motocross apparel — ride hard, look harder.",
  url: process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000",
} as const;
