import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/lib/cart/store";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF7]/95 backdrop-blur-sm border-b border-[#e5e0d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="font-heading text-2xl tracking-widest text-[#111] hover:text-[#6B4423] transition-colors">
          JP MOTORCROSS
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/shop"
            className="font-heading text-sm tracking-wider text-[#444] hover:text-[#6B4423] transition-colors [&.active]:text-[#3E2A1E]"
          >
            SHOP
          </Link>
          {session ? (
            <button
              onClick={() => signOut()}
              className="font-heading text-sm tracking-wider text-[#444] hover:text-[#6B4423] transition-colors cursor-pointer"
            >
              SIGN OUT
            </button>
          ) : (
            <Link
              to="/sign-in"
              className="font-heading text-sm tracking-wider text-[#444] hover:text-[#6B4423] transition-colors"
            >
              SIGN IN
            </Link>
          )}
        </nav>

        <Link to="/cart" className="relative group">
          <CartIcon />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#3E2A1E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-[#111] group-hover:text-[#6B4423] transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}
