import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminProductsFn } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/products/")({
  loader: () => listAdminProductsFn(),
  component: AdminProductsPage,
});

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-gray-200 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs capitalize ${
        STATUS_STYLES[status] ?? "bg-gray-200 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-foreground text-xl uppercase tracking-wider">
            Products
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Create and manage the products in your store.
          </p>
        </div>
        <Link to="/admin/products/new" size="sm" className="shrink-0">
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-faded-foreground">
          <p className="font-heading text-xl">NO PRODUCTS</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-auto px-4 py-2" />
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableRow key={p.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}>
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
                        <StatusBadge status={p.status} />
                      </TableHead>
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
                                : "text-secondary-foreground"
                          }
                        >
                          {p.totalStock}
                        </span>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-3">
                          <Button variant="muted" size="none" onClick={() => toggle(p.id)}>
                            {isExpanded ? "Hide sizes" : "Show sizes"}
                          </Button>
                          <Link
                            variant="unstyled"
                            className="rounded-sm font-heading text-primary text-xs underline underline-offset-4 hover:text-primary/80"
                            to="/admin/products/$productId"
                            params={{ productId: p.id }}
                          >
                            Edit
                          </Link>
                        </div>
                      </TableHead>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${p.id}-variants`} className="bg-muted">
                        <td colSpan={7} className="px-8 py-3">
                          <div className="flex flex-wrap gap-4">
                            {sortedVariants.map((v) => (
                              <div key={v.id} className="text-sm">
                                <span className="font-heading text-muted-foreground text-xs tracking-wider">
                                  {v.size}
                                </span>
                                <span
                                  className={`ml-2 ${v.stock === 0 ? "text-red-600" : v.stock < 3 ? "text-amber-700" : "text-secondary-foreground"}`}
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
