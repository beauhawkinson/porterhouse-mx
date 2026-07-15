import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Fragment, useState } from "react";

import Link from "@/components/ui/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    unfulfilled: "bg-muted text-primary",
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
  const { hasProducts } = useRouteContext({ from: "__root__" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Column count for the detail row's colSpan — keep in sync with the header.
  const COLUMN_COUNT = 6;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl text-foreground">My Account</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your profile and track your orders.
        </p>
      </div>

      {/* Profile card */}
      <div className="mb-10 flex items-center gap-4 p-6">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "Profile"}
            className="h-13 w-13 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted font-heading text-foreground text-xl">
            {(user.name ?? user.email ?? "?")[0]?.toUpperCase()}
          </div>
        )}
        <div>
          {user.name && <p className="font-heading text-foreground text-lg">{user.name}</p>}
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      {/* Orders section */}
      <div>
        <h2 className="mb-4 font-heading text-foreground text-xl tracking-wider">ORDER HISTORY</h2>

        {orders.length === 0 ? (
          <div className="border px-6 py-16 text-center">
            <p className="mb-1 font-heading text-secondary-foreground">NO ORDERS YET</p>
            <p className="mb-6 text-muted-foreground text-sm">
              Orders you place while signed in will appear here.
            </p>
            {hasProducts && <Link to="/shop">Shop now</Link>}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o, i) => {
                const isOpen = expanded.has(o.id);
                const rowBg = i % 2 === 0 ? "bg-background" : "bg-muted/40";

                return (
                  <Fragment key={o.id}>
                    <TableRow className={`${rowBg} cursor-pointer`} onClick={() => toggle(o.id)}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(o.id);
                          }}
                          aria-label={isOpen ? "Collapse order" : "Expand order"}
                          aria-expanded={isOpen}
                          className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="select-text font-mono text-secondary-foreground text-xs tracking-wider">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{formatDate(o.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-0.5 font-medium text-xs tracking-wider ${statusBadge(o.status)}`}
                        >
                          {o.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-0.5 font-medium text-xs tracking-wider ${fulfillmentBadge(o.fulfillmentStatus)}`}
                        >
                          {o.fulfillmentStatus.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="font-heading text-foreground">
                        {formatCents(o.amountTotalCents)}
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className={rowBg}>
                        <TableCell colSpan={COLUMN_COUNT} className="select-text p-0">
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-1 gap-6">
                              {/* Items */}
                              <div>
                                <p className="mb-2 font-heading text-foreground text-xs tracking-wider">
                                  ITEMS
                                </p>
                                <ul className="space-y-1 text-secondary-foreground text-sm">
                                  {o.items.map((item) => (
                                    <li key={item.id} className="flex justify-between gap-4">
                                      <span>
                                        {item.nameSnapshot} — Size {item.sizeSnapshot} ×{" "}
                                        {item.quantity}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Tracking */}
                              <div>
                                <p className="mb-2 font-heading text-foreground text-xs tracking-wider">
                                  TRACKING
                                </p>

                                {o.trackingNumber ? (
                                  <div className="flex items-center gap-4">
                                    {o.trackingCarrier && (
                                      <p className="text-muted-foreground text-xs tracking-wider">
                                        {o.trackingCarrier}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <span className="select-all font-mono text-secondary-foreground text-xs">
                                        {o.trackingNumber}
                                      </span>
                                      <CopyButton value={o.trackingNumber} />
                                    </div>
                                    {trackingUrl(o.trackingCarrier, o.trackingNumber) && (
                                      <a
                                        href={
                                          trackingUrl(o.trackingCarrier, o.trackingNumber) ?? "#"
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-primary text-xs underline hover:text-primary/80"
                                      >
                                        Track package →
                                      </a>
                                    )}
                                  </div>
                                ) : o.fulfillmentStatus === "unfulfilled" && o.status === "paid" ? (
                                  <p className="text-muted-foreground text-sm">
                                    Your order is being prepared — tracking will appear once
                                    shipped.
                                  </p>
                                ) : (
                                  <p className="text-faded-foreground text-sm">—</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function trackingUrl(carrier: string | null | undefined, number: string): string | null {
  if (!carrier) return null;
  const c = carrier.toLowerCase();
  const n = encodeURIComponent(number);
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("dhl"))
    return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?tracking-id=${n}`;
  return null;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row toggle
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy tracking number"}
      className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
