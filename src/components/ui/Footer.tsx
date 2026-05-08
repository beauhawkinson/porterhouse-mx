import { Link } from "@tanstack/react-router";
import { Splatter4 } from "@/components/splatter";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[#e5e0d8] bg-[#FAFAF7] overflow-hidden">
      <Splatter4
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-64 opacity-20"
        color="#6B4423"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-heading text-2xl tracking-widest text-[#111] mb-2">
              JP MOTORCROSS
            </p>
            <p className="text-sm text-[#666] max-w-xs">
              Premium motocross apparel. Ride hard, look harder.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-heading text-xs tracking-wider text-[#888] mb-3">SHOP</p>
              <ul className="space-y-2 text-sm text-[#555]">
                <li><Link to="/shop" className="hover:text-[#6B4423] transition-colors">All Products</Link></li>
                <li><Link to="/shop" search={{ category: "tshirt" as const }} className="hover:text-[#6B4423] transition-colors">T-Shirts</Link></li>
                <li><Link to="/shop" search={{ category: "sweatshirt" as const }} className="hover:text-[#6B4423] transition-colors">Sweatshirts</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-heading text-xs tracking-wider text-[#888] mb-3">ACCOUNT</p>
              <ul className="space-y-2 text-sm text-[#555]">
                <li><Link to="/sign-in" className="hover:text-[#6B4423] transition-colors">Sign In</Link></li>
                <li><Link to="/cart" className="hover:text-[#6B4423] transition-colors">Cart</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#e5e0d8] text-xs text-[#999]">
          © {new Date().getFullYear()} JP Motorcross. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
