import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { NotFound, RouteError } from "@/components/ui/error-states";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { app } from "@/lib/config/app.config";
import { checkIsAdminFn } from "@/lib/server/admin";
import { hasActiveProductsFn } from "@/lib/server/products";
import { checkIsSignedInFn } from "@/lib/server/session";
import appCss from "../styles.css?url";

import type { PropsWithChildren } from "react";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const [isAdmin, hasProducts, isSignedIn] = await Promise.all([
      checkIsAdminFn().catch(() => false),
      hasActiveProductsFn().catch(() => false),
      checkIsSignedInFn().catch(() => false),
    ]);
    return { isAdmin, hasProducts, isSignedIn };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: app.brand.name },
      { name: "description", content: app.description },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#000000" },
      { name: "apple-mobile-web-app-title", content: app.brand.name },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: app.brand.name },
      { property: "og:title", content: app.brand.name },
      { property: "og:description", content: app.description },
      { property: "og:url", content: app.url },
      { property: "og:image", content: `${app.url}/android-chrome-512x512.png` },
      { property: "og:image:alt", content: `${app.brand.name} logo` },
      { property: "og:locale", content: "en_US" },
      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: app.brand.name },
      { name: "twitter:description", content: app.description },
      { name: "twitter:image", content: `${app.url}/android-chrome-512x512.png` },
      { name: "twitter:image:alt", content: `${app.brand.name} logo` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: app.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: RouteError,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col pt-16 pb-16">{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
