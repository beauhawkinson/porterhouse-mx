import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
      <p className="text-[#999] text-sm">{products.length} products</p>

      {products.length === 0 ? (
        <div className="py-16 text-center text-[#999]">
          <p className="font-heading text-xl">NO PRODUCTS</p>
        </div>
      ) : (
        <div className="border border-[#e5e0d8]">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0eb]">
              <tr>
                <th className="w-16 px-4 py-2" />
                <th className="px-4 py-2 text-left font-heading text-[#666] text-xs tracking-wider">
                  NAME
                </th>
                <th className="px-4 py-2 text-left font-heading text-[#666] text-xs tracking-wider">
                  CATEGORY
                </th>
                <th className="px-4 py-2 text-left font-heading text-[#666] text-xs tracking-wider">
                  PRICE
                </th>
                <th className="px-4 py-2 text-right font-heading text-[#666] text-xs tracking-wider">
                  TOTAL STOCK
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const isExpanded = expanded.has(p.id);
                const sortedVariants = [...p.variants].sort(
                  (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size),
                );

                return (
                  <>
                    <tr
                      key={p.id}
                      className={`border-[#e5e0d8] border-t ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"} transition-colors hover:bg-[#f5f0eb]`}
                    >
                      <td className="px-4 py-2">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="h-10 w-10 object-cover" />
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium text-[#333]">{p.name}</td>
                      <td className="px-4 py-2 text-[#555] capitalize">{p.category}</td>
                      <td className="px-4 py-2 text-[#555]">
                        {(p.priceCents / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">
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
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggle(p.id)}
                            className="text-[#999] text-xs underline hover:text-[#333]"
                          >
                            {isExpanded ? "Hide sizes" : "Show sizes"}
                          </button>
                          <Link
                            to="/admin/products/$productId"
                            params={{ productId: p.id }}
                            className="font-heading text-[#6B4423] text-xs tracking-wider underline hover:text-[#3E2A1E]"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-variants`} className="bg-[#f5f0eb]">
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
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
