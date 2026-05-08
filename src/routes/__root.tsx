import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { app } from "@/lib/config/app.config";
import appCss from "../styles.css?url";

import type { PropsWithChildren } from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: app.brand.name },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
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
      <body className="flex min-h-screen flex-col bg-[#FAFAF7]">
        <Header />
        <main className="flex flex-1 flex-col pt-16">{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
