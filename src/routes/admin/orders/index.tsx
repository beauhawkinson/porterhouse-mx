import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrdersFn } from "@/lib/server/admin";
import { FulfillmentBadge, PaymentBadge } from "@/routes/admin/index";

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
    const params = searchSchema.parse(search);
    return listOrdersFn({
      data: {
        paymentStatus: params.paymentStatus,
        fulfillmentStatus: params.fulfillmentStatus,
        searchEmail: params.searchEmail,
        page: params.page,
        sort: params.sort,
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
  const navigate = useNavigate({ from: "/admin/orders/" });
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
          <p className="text-[#999] text-xs tracking-wider">Payment</p>
          <Select
            value={search.paymentStatus ?? "all"}
            onValueChange={(value) =>
              updateFilter({
                paymentStatus: value as z.infer<typeof searchSchema>["paymentStatus"],
              })
            }
          >
            <SelectTrigger asChild>
              <Button variant="outline">
                <SelectValue />
                <ChevronDown className="size-4" />
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[#999] text-xs tracking-wider">Fulfillment</p>
          <Select
            value={search.fulfillmentStatus ?? "all"}
            onValueChange={(value) =>
              updateFilter({
                fulfillmentStatus: value as z.infer<typeof searchSchema>["fulfillmentStatus"],
              })
            }
          >
            <SelectTrigger asChild>
              <Button variant="outline">
                <SelectValue />
                <ChevronDown className="size-4" />
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[#999] text-xs tracking-wider">Sort</p>
          <Select
            value={search.sort ?? "desc"}
            onValueChange={(value) => updateFilter({ sort: value as "asc" | "desc" })}
          >
            <SelectTrigger asChild>
              <Button variant="outline">
                <SelectValue />
                <ChevronDown className="size-4" />
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleEmailSearch} className="flex flex-col gap-1">
          <p className="text-[#999] text-xs tracking-wider">Email search</p>
          <div className="flex gap-1">
            <Input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="beau@gmail.com"
            />
            <button
              type="submit"
              className="border border-[#e5e0d8] bg-white px-3 py-1.5 text-[#333] text-sm hover:bg-[#f5f0eb]"
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
                className="px-3 py-1.5 text-[#999] text-sm hover:text-[#333]"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="text-[#999] text-sm">
        {total} order{total !== 1 ? "s" : ""}
        {search.searchEmail ? ` matching "${search.searchEmail}"` : ""}
      </p>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="py-16 text-center text-[#999]">
          <p className="font-heading text-xl">NO ORDERS FOUND</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-[#f5f0eb]">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="px-4 py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o, i) => (
                <TableRow key={o.id} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"}>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>{o.customerEmail ?? "—"}</TableCell>
                  <TableCell>{o.items.length}</TableCell>
                  <TableCell>{formatCents(o.amountTotalCents)}</TableCell>
                  <TableCell>
                    <PaymentBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/admin/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="font-heading text-[#6B4423] text-xs tracking-wider underline hover:text-[#3E2A1E]"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              className="border border-[#e5e0d8] px-3 py-1 text-[#333] hover:bg-[#f5f0eb] disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
              className="border border-[#e5e0d8] px-3 py-1 text-[#333] hover:bg-[#f5f0eb] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
