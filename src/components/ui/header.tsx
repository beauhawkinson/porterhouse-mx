import { Link, useRouteContext } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { signOut, useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart/store";
import { app } from "@/lib/config/app.config";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();
  const { isAdmin } = useRouteContext({ from: "__root__" });

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-[#e5e0d8] border-b bg-[#FAFAF7]/80 backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-6">
        {/* Left: logo */}
        <Link
          to="/"
          className="justify-self-start font-moto_is_life text-2xl text-[#111] tracking-widest transition-colors hover:text-[#6B4423]"
        >
          {app.brand.name}
        </Link>

        {/* Center: nav */}
        <nav className="hidden items-center justify-center gap-8 justify-self-center md:flex">
          <Link
            to="/shop"
            className="font-heading text-[#444] text-sm tracking-wider transition-colors hover:text-[#6B4423] [&.active]:text-[#3E2A1E]"
          >
            SHOP
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="font-heading text-[#444] text-sm tracking-wider transition-colors hover:text-[#6B4423] [&.active]:text-[#3E2A1E]"
            >
              ADMIN
            </Link>
          )}

          {session ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="cursor-pointer font-heading text-[#444] text-sm tracking-wider transition-colors hover:text-[#6B4423]"
            >
              SIGN OUT
            </button>
          ) : (
            <Link
              to="/sign-in"
              className="font-heading text-[#444] text-sm tracking-wider transition-colors hover:text-[#6B4423]"
            >
              SIGN IN
            </Link>
          )}
        </nav>

        {/* Right: cart */}
        <Link to="/cart" className="group relative justify-self-end">
          <ShoppingCart />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#3E2A1E] font-bold text-white text-xs">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
