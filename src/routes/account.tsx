import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getMyOrdersFn } from "@/lib/server/account";

export const Route = createFileRoute("/account")({
  loader: () => getMyOrdersFn(),
  component: AccountPage,
});

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    refunded: "bg-red-100 text-red-800",
    fulfilled: "bg-blue-100 text-blue-800",
  };
  return styles[status] ?? "bg-gray-100 text-gray-700";
}

function fulfillmentBadge(status: string) {
  const styles: Record<string, string> = {
    unfulfilled: "bg-[#f5f0eb] text-[#6B4423]",
    fulfilled: "bg-blue-100 text-blue-800",
    shipped: "bg-green-100 text-green-800",
  };
  return styles[status] ?? "bg-gray-100 text-gray-700";
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCents(cents: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function AccountPage() {
  const { user, orders } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl text-[#111]">MY ACCOUNT</h1>
        <p className="mt-1 text-[#666] text-sm">Manage your profile and track your orders.</p>
      </div>

      {/* Profile card */}
      <div className="mb-10 flex items-center gap-4 border border-[#e5e0d8] bg-white p-6">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "Profile"}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3E2A1E] font-heading text-white text-xl">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          {user.name && <p className="font-heading text-[#111] text-lg">{user.name}</p>}
          <p className="text-[#666] text-sm">{user.email}</p>
        </div>
      </div>

      {/* Orders section */}
      <div>
        <h2 className="mb-4 font-heading text-xl text-[#111] tracking-wider">ORDER HISTORY</h2>

        {orders.length === 0 ? (
          <div className="border border-[#e5e0d8] bg-white px-6 py-16 text-center">
            <p className="mb-1 font-heading text-[#333]">NO ORDERS YET</p>
            <p className="mb-6 text-[#666] text-sm">
              Orders you place while signed in will appear here.
            </p>
            <Link to="/shop">
              <Button>SHOP NOW</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="border border-[#e5e0d8] bg-white p-6">
                {/* Order header row */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[#999] text-xs tracking-wider">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[#666] text-sm">{formatDate(o.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 font-medium text-xs tracking-wider ${statusBadge(o.status)}`}
                    >
                      {o.status.toUpperCase()}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 font-medium text-xs tracking-wider ${fulfillmentBadge(o.fulfillmentStatus)}`}
                    >
                      {o.fulfillmentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <ul className="mb-4 space-y-1.5 border-[#e5e0d8] border-t pt-4">
                  {o.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#333]">
                        {item.nameSnapshot} — Size {item.sizeSnapshot} × {item.quantity}
                      </span>
                      <span className="font-medium text-[#111]">
                        {formatCents(item.priceCentsSnapshot * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Total + tracking */}
                <div className="flex flex-wrap items-end justify-between gap-3 border-[#e5e0d8] border-t pt-4">
                  <div className="text-sm">
                    {o.trackingNumber ? (
                      <div>
                        <p className="mb-0.5 text-[#999] text-xs tracking-wider">TRACKING</p>
                        <p className="font-mono text-[#333] text-xs">
                          {o.trackingCarrier && (
                            <span className="mr-2 text-[#666]">{o.trackingCarrier}</span>
                          )}
                          {o.trackingNumber}
                        </p>
                      </div>
                    ) : o.fulfillmentStatus === "unfulfilled" && o.status === "paid" ? (
                      <p className="text-[#666] text-xs">
                        Your order is being prepared — tracking will appear once shipped.
                      </p>
                    ) : null}
                  </div>

                  <p className="font-heading text-[#111] text-sm">
                    Total: {formatCents(o.amountTotalCents)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
