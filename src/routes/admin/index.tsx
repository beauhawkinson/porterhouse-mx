import { Link, createFileRoute } from "@tanstack/react-router";

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
        <StatCard label="Total Revenue" value={formatCents(totalRevenueCents)} />
        <StatCard
          label="Unfulfilled"
          value={String(fulfillmentCounts.unfulfilled)}
          accent="amber"
        />
        <StatCard label="Fulfilled" value={String(fulfillmentCounts.fulfilled)} accent="green" />
        <StatCard label="Shipped" value={String(fulfillmentCounts.shipped)} accent="blue" />
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber" | "green" | "blue";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-700"
      : accent === "green"
        ? "text-green-700"
        : accent === "blue"
          ? "text-blue-700"
          : "text-[#111]";

  return (
    <div className="rounded-lg border border-[#e5e0d8] bg-white p-2">
      <p className="mb-1 text-[#999] text-xs tracking-wider">{label}</p>
      <p className={`font-heading text-xs ${accentClass}`}>{value}</p>
    </div>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "refunded"
        ? "bg-red-100 text-red-800"
        : "bg-[#f5f0eb] text-[#666]";

  return (
    <span className={`inline-block rounded px-2 py-0.5 font-medium text-xs tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export function FulfillmentBadge({ status }: { status: string }) {
  const cls =
    status === "shipped"
      ? "bg-green-100 text-green-800"
      : status === "fulfilled"
        ? "bg-blue-100 text-blue-800"
        : "bg-amber-100 text-amber-800";

  return (
    <span className={`inline-block rounded px-2 py-0.5 font-medium text-xs tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
