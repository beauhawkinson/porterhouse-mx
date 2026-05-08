import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JP Motorcross — Premium Motocross Apparel" },
      {
        name: "description",
        content: "Premium motocross apparel for riders. Shop tees, hoodies, and more.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),

  component: function RootComponent() {
    return (
      <html lang="en">
        <head>
          <Meta />
        </head>
        <body className="min-h-screen bg-[#FAFAF7]">
          <Navbar />
          <main className="pt-16">
            <Outlet />
          </main>
          <Footer />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  },
});
