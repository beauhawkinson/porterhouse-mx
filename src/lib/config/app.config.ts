export const app = {
  name: "Porterhouse MX",
  brand: {
    name: "Moto Is Life",
    logoUrl: "/logo.png",
  },
  description: "Premium motocross apparel — ride hard, look harder.",
  url: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  email: "jlport112@gmail.com",
} as const;
