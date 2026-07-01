import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { app } from "@/lib/config/app.config";
import { checkIsAdminFn } from "@/lib/server/admin";
import { hasActiveProductsFn } from "@/lib/server/products";
import appCss from "../styles.css?url";

import type { PropsWithChildren } from "react";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const [isAdmin, hasProducts] = await Promise.all([
      checkIsAdminFn().catch(() => false),
      hasActiveProductsFn().catch(() => false),
    ]);
    return { isAdmin, hasProducts };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: app.brand.name },
      { name: "description", content: app.description },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: app.brand.name },
      { property: "og:title", content: app.brand.name },
      { property: "og:description", content: app.description },
      { property: "og:url", content: "https://motoislife.vercel.app" },
      { property: "og:image", content: "https://motoislife.vercel.app/logo512.png" },
      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: app.brand.name },
      { name: "twitter:description", content: app.description },
      { name: "twitter:image", content: "https://motoislife.vercel.app/logo512.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "canonical", href: "https://motoislife.vercel.app" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  // Admins get an extra header row (the home-design preview bar), so the main
  // content needs more top padding to clear the taller fixed header.
  const { isAdmin } = Route.useRouteContext();
  return (
    <RootDocument isAdmin={isAdmin}>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ isAdmin, children }: PropsWithChildren<{ isAdmin: boolean }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className={`flex flex-1 flex-col pb-16 ${isAdmin ? "pt-48" : "pt-16"}`}>
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
