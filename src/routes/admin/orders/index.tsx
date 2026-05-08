import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { FulfillmentBadge, PaymentBadge } from "@/routes/admin/index";
import { listOrdersFn } from "@/lib/server/admin";

const searchSchema = z.object({
  paymentStatus: z.enum(["all", "pending", "paid", "refunded"]).optional().default("all"),
  fulfillmentStatus: z
    .enum(["all", "unfulfilled", "fulfilled", "shipped"])
    .optional()
    .default("all"),
  searchEmail: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const Route = createFileRoute("/admin/orders/")({
  validateSearch: searchSchema,
  loader: ({ location: { search } }) => {
    const params = search as z.infer<typeof searchSchema>;
    return listOrdersFn({
      data: {
        paymentStatus: params.paymentStatus ?? "all",
        fulfillmentStatus: params.fulfillmentStatus ?? "all",
        searchEmail: params.searchEmail,
        page: params.page ?? 1,
        sort: params.sort ?? "desc",
        limit: 50,
      },
    });
  },
  component: AdminOrdersPage,
});

function formatCents(cents: number | null | undefined) {
  if (!cents) return "—";
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(date: string | Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AdminOrdersPage() {
  const { orders, total, page, limit } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/orders" });
  const [emailInput, setEmailInput] = useState(search.searchEmail ?? "");

  function updateFilter(updates: Partial<z.infer<typeof searchSchema>>) {
    navigate({ search: (prev) => ({ ...prev, ...updates, page: 1 }) });
  }

  function handleEmailSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter({ searchEmail: emailInput || undefined });
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#999] uppercase tracking-wider">Payment</label>
          <select
            value={search.paymentStatus ?? "all"}
            onChange={(e) =>
              updateFilter({
                paymentStatus: e.target.value as z.infer<typeof searchSchema>["paymentStatus"],
              })
            }
            className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-sm text-[#333]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#999] uppercase tracking-wider">Fulfillment</label>
          <select
            value={search.fulfillmentStatus ?? "all"}
            onChange={(e) =>
              updateFilter({
                fulfillmentStatus: e.target.value as z.infer<
                  typeof searchSchema
                >["fulfillmentStatus"],
              })
            }
            className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-sm text-[#333]"
          >
            <option value="all">All</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#999] uppercase tracking-wider">Sort</label>
          <select
            value={search.sort ?? "desc"}
            onChange={(e) =>
              updateFilter({ sort: e.target.value as "asc" | "desc" })
            }
            className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-sm text-[#333]"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        <form onSubmit={handleEmailSearch} className="flex flex-col gap-1">
          <label className="text-xs text-[#999] uppercase tracking-wider">Email search</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="customer@example.com"
              className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-sm text-[#333] placeholder:text-[#bbb]"
            />
            <button
              type="submit"
              className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-sm text-[#333] hover:bg-[#f5f0eb]"
            >
              Search
            </button>
            {search.searchEmail && (
              <button
                type="button"
                onClick={() => {
                  setEmailInput("");
                  updateFilter({ searchEmail: undefined });
                }}
                className="px-3 py-1.5 text-sm text-[#999] hover:text-[#333]"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="text-sm text-[#999]">
        {total} order{total !== 1 ? "s" : ""}
        {search.searchEmail ? ` matching "${search.searchEmail}"` : ""}
      </p>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="py-16 text-center text-[#999]">
          <p className="font-heading text-xl">NO ORDERS FOUND</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#e5e0d8]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#f5f0eb]">
              <tr>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  DATE
                </th>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  CUSTOMER
                </th>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  ITEMS
                </th>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  TOTAL
                </th>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  PAYMENT
                </th>
                <th className="px-4 py-2 text-left font-heading text-xs tracking-wider text-[#666]">
                  FULFILLMENT
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  className={`border-[#e5e0d8] border-t ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"} hover:bg-[#f5f0eb] transition-colors`}
                >
                  <td className="whitespace-nowrap px-4 py-2 text-[#555]">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-[#333]">{o.customerEmail ?? "—"}</div>
                  </td>
                  <td className="px-4 py-2 text-[#555]">{o.items.length}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-[#333]">
                    {formatCents(o.amountTotalCents)}
                  </td>
                  <td className="px-4 py-2">
                    <PaymentBadge status={o.status} />
                  </td>
                  <td className="px-4 py-2">
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to="/admin/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="font-heading text-xs tracking-wider text-[#6B4423] underline hover:text-[#3E2A1E]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#999]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })}
              className="border border-[#e5e0d8] px-3 py-1 text-[#333] disabled:opacity-40 hover:bg-[#f5f0eb]"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
              className="border border-[#e5e0d8] px-3 py-1 text-[#333] disabled:opacity-40 hover:bg-[#f5f0eb]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
