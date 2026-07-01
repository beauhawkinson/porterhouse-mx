export const app = {
  name: "Porterhouse MX",
  brand: {
    name: "Moto Is Life",
    logoUrl: "/logo.png",
  },
  description: "Premium motocross apparel — ride hard, look harder.",
  url: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  email: "jlport112@gmail.com",
  // Flat shipping charged at checkout, in cents. Single source of truth for
  // both the cart summary and the Stripe shipping rate. Set to 0 for free
  // shipping (e.g. a cheap live-mode test). `as number` keeps it a real knob
  // rather than being narrowed to a literal.
  shippingCents: 800 as number,
} as const;
