import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import Link from "@/components/ui/link";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminProductsFn } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/products/")({
  loader: () => listAdminProductsFn(),
  component: AdminProductsPage,
});

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

function AdminProductsPage() {
  const products = Route.useLoaderData();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-foreground text-xl tracking-wider">Products</h2>
        <Link to="/admin/products/new" size="sm">
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-[#999]">
          <p className="font-heading text-xl">NO PRODUCTS</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#e5e0d8]">
          <Table>
            <TableHeader className="bg-[#f5f0eb]">
              <TableRow>
                <TableHead className="w-auto px-4 py-2" />
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead className="px-4 py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, i) => {
                const isExpanded = expanded.has(p.id);
                const sortedVariants = [...p.variants].sort(
                  (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size),
                );

                return (
                  <>
                    <TableRow key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"}>
                      <TableHead>
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-13 w-13 shrink-0 object-cover"
                          />
                        )}
                      </TableHead>
                      <TableHead>{p.name}</TableHead>
                      <TableHead>{p.category}</TableHead>
                      <TableHead>
                        {(p.priceCents / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableHead>
                      <TableHead>
                        <span
                          className={
                            p.totalStock === 0
                              ? "text-red-600"
                              : p.totalStock < 5
                                ? "text-amber-700"
                                : "text-[#333]"
                          }
                        >
                          {p.totalStock}
                        </span>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggle(p.id)}
                            className="text-[#999] text-xs underline hover:text-[#333]"
                          >
                            {isExpanded ? "Hide sizes" : "Show sizes"}
                          </button>
                          <Link
                            variant="action"
                            to="/admin/products/$productId"
                            params={{ productId: p.id }}
                          >
                            Edit
                          </Link>
                        </div>
                      </TableHead>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${p.id}-variants`} className="bg-[#f5f0eb]">
                        <td colSpan={6} className="px-8 py-3">
                          <div className="flex flex-wrap gap-4">
                            {sortedVariants.map((v) => (
                              <div key={v.id} className="text-sm">
                                <span className="font-heading text-[#666] text-xs tracking-wider">
                                  {v.size}
                                </span>
                                <span
                                  className={`ml-2 ${v.stock === 0 ? "text-red-600" : v.stock < 3 ? "text-amber-700" : "text-[#333]"}`}
                                >
                                  {v.stock} in stock
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
