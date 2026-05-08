import { Link } from "@tanstack/react-router";

import { app } from "@/lib/config/app.config";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-[#e5e0d8] border-t bg-[#FAFAF7]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <p className="mb-2 font-porterhouse_mx text-2xl text-[#111] tracking-widest">
              {app.name}
            </p>
            <p className="max-w-xs text-[#666] text-sm">
              Premium motocross apparel. Ride hard, look harder.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="mb-3 font-heading text-[#888] text-xs tracking-wider">SHOP</p>
              <ul className="space-y-2 text-[#555] text-sm">
                <li>
                  <Link to="/shop" className="transition-colors hover:text-[#6B4423]">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    search={{ category: "tshirt" as const }}
                    className="transition-colors hover:text-[#6B4423]"
                  >
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    search={{ category: "sweatshirt" as const }}
                    className="transition-colors hover:text-[#6B4423]"
                  >
                    Sweatshirts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-heading text-[#888] text-xs tracking-wider">ACCOUNT</p>
              <ul className="space-y-2 text-[#555] text-sm">
                <li>
                  <Link to="/sign-in" className="transition-colors hover:text-[#6B4423]">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="transition-colors hover:text-[#6B4423]">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-6 text-[#999] text-xs">
          © {new Date().getFullYear()} {app.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
