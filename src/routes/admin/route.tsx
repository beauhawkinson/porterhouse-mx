import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

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
      <header className="mb-8 flex items-center justify-between border-[#e5e0d8] border-b pb-4">
        <h1 className="font-heading text-3xl text-[#111] tracking-wider">ADMIN</h1>
        <nav className="flex gap-6 font-medium text-sm">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className="font-heading text-[#666] tracking-wider transition-colors hover:text-[#3E2A1E] [&.active]:text-[#111] [&.active]:underline"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/orders"
            className="font-heading text-[#666] tracking-wider transition-colors hover:text-[#3E2A1E] [&.active]:text-[#111] [&.active]:underline"
          >
            Orders
          </Link>
          <Link
            to="/admin/products"
            className="font-heading text-[#666] tracking-wider transition-colors hover:text-[#3E2A1E] [&.active]:text-[#111] [&.active]:underline"
          >
            Products
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
