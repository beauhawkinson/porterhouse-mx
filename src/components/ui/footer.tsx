import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";

const Footer = () => {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-faded-foreground text-xs">
          © {new Date().getFullYear()} {app.name}. All rights reserved.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/shop" variant="nav" size="none">
            Shop
          </Link>
          <Link to="/legal/shipping-returns" variant="nav" size="none">
            Shipping &amp; Returns
          </Link>
          <Link to="/legal/privacy" variant="nav" size="none">
            Privacy
          </Link>
          <Link to="/legal/terms" variant="nav" size="none">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export { Footer };
