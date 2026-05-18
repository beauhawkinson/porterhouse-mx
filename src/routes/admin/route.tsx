import { Outlet, createFileRoute } from "@tanstack/react-router";

import Link from "@/components/ui/link";
import { requireAdminFn } from "@/lib/server/admin";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    await requireAdminFn();
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center justify-between border-border border-b pb-4">
        <h1 className="font-heading text-3xl text-foreground tracking-wider">Admin</h1>
        <nav className="flex gap-6">
          <Link to="/admin" activeOptions={{ exact: true }} variant="nav" size="none">
            Dashboard
          </Link>
          <Link to="/admin/orders" variant="nav" size="none">
            Orders
          </Link>
          <Link to="/admin/products" variant="nav" size="none">
            Products
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
