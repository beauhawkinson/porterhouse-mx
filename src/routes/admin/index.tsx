import { Link, createFileRoute } from "@tanstack/react-router";

import { FulfillmentBadge, PaymentBadge } from "@/components/ui/status-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardStatsFn } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/")({
  loader: () => getDashboardStatsFn(),
  component: AdminDashboard,
});

function formatCents(cents: number) {
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

function AdminDashboard() {
  const { fulfillmentCounts, totalRevenueCents, recentOrders } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="mb-1 text-[#999] text-xs tracking-wider">Total Revenue</p>
          <p className="font-heading text-xs">{formatCents(totalRevenueCents)}</p>
        </div>
        <div>
          <p className="mb-1 text-[#999] text-xs tracking-wider">Unfulfilled</p>
          <p className="font-heading text-xs">{String(fulfillmentCounts.unfulfilled)}</p>
        </div>
        <div>
          <p className="mb-1 text-[#999] text-xs tracking-wider">Fulfilled</p>
          <p className="font-heading text-xs">{String(fulfillmentCounts.fulfilled)}</p>
        </div>
        <div>
          <p className="mb-1 text-[#999] text-xs tracking-wider">Shipped</p>
          <p className="font-heading text-xs">{String(fulfillmentCounts.shipped)}</p>
        </div>
      </div>

      {/* Recent orders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-[#333] tracking-wider">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-[#6B4423] text-sm underline hover:text-[#3E2A1E]"
          >
            View all
          </Link>
        </div>
        {/*  AdminDashboard.tsx */}
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-[#999]">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-[#f5f0eb]">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fulfillment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o, i) => (
                  <TableRow key={o.id} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"}>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell>
                      <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: o.id }}
                        className="underline"
                      >
                        {o.customerEmail ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {o.amountTotalCents ? formatCents(o.amountTotalCents) : "—"}
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={o.status} />
                    </TableCell>
                    <TableCell>
                      <FulfillmentBadge status={o.fulfillmentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
