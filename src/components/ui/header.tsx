import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { signOut, useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart/store";
import { app } from "@/lib/config/app.config";

const Header = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();
  const { isAdmin, hasProducts } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  // Sign out, land on the home page, then refresh the root context (isSignedIn,
  // isAdmin) so the header and any gated UI update immediately.
  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/" });
    await router.invalidate();
  };

  // Close the mobile menu on Escape and lock body scroll while it's open.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Allow
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-border border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 md:grid-cols-3 md:px-8">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-2 justify-self-start">
          <Button
            variant="ghost"
            size="icon-md"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="-ml-2 md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link to="/" onClick={closeMobile} variant="logo" size="none">
            {app.brand.name}
          </Link>
        </div>

        {/* Center: nav (desktop) */}
        <nav className="hidden items-center justify-center gap-8 justify-self-center md:flex">
          {hasProducts && (
            <Link to="/shop" variant="nav" size="none">
              Shop
            </Link>
          )}

          {isAdmin && session && (
            <Link to="/admin" variant="nav" size="none">
              Admin
            </Link>
          )}

          {session ? (
            <>
              <Link to="/account" variant="nav" size="none">
                Account
              </Link>

              <Button onClick={handleSignOut} variant="nav" size="none">
                Logout
              </Button>
            </>
          ) : (
            <Link to="/sign-in" variant="nav" size="none">
              Sign In
            </Link>
          )}
        </nav>

        {/* Right: cart — hidden when there's nothing to buy */}
        {hasProducts ? (
          <Link
            to="/cart"
            onClick={closeMobile}
            variant="unstyled"
            size="none"
            className="group relative justify-self-end rounded-md border border-transparent text-foreground hover:text-primary focus-visible:border-primary"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item${totalItems === 1 ? "" : "s"}` : ""}`}
          >
            <ShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground font-bold text-background text-xs">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
        ) : (
          // Keep the grid's third column so the logo/nav stay centered.
          <span aria-hidden className="justify-self-end" />
        )}
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-border border-t bg-background transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
          {hasProducts && (
            <Link to="/shop" onClick={closeMobile} variant="nav-mobile" size="none">
              Shop
            </Link>
          )}

          {isAdmin && session && (
            <Link to="/admin" onClick={closeMobile} variant="nav-mobile" size="none">
              Admin
            </Link>
          )}

          {session ? (
            <>
              <Link to="/account" onClick={closeMobile} variant="nav-mobile" size="none">
                Account
              </Link>
              <Button
                onClick={() => {
                  closeMobile();
                  handleSignOut();
                }}
                variant="nav-mobile"
                size="none"
                className="text-left"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/sign-in" onClick={closeMobile} variant="nav-mobile" size="none">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export { Header };
