import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/status-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOrderFn,
  refundOrderFn,
  updateFulfillmentFn,
  updateOrderNotesFn,
} from "@/lib/server/admin";

export const Route = createFileRoute("/admin/orders/$orderId")({
  loader: ({ params }) => getOrderFn({ data: params.orderId }),
  component: OrderDetailPage,
});

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Keeps select-trigger / form-control buttons in sentence case rather than
// inheriting the Button base uppercase.
const formButtonClass = "normal-case tracking-normal";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="muted" size="none" onClick={copy} className="ml-2">
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

// Bordered info card pattern used throughout the page.
function InfoCard({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-background p-4">
      <h2 className="mb-3 flex items-center font-heading text-foreground text-sm tracking-wider">
        {title}
        {trailing}
      </h2>
      {children}
    </section>
  );
}

// Label-style paragraph used above input fields and inside cards.
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-faded-foreground text-xs tracking-wider">{children}</p>;
}

function OrderDetailPage() {
  const initialOrder = Route.useLoaderData();
  const [order, setOrder] = useState(initialOrder);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [notes, setNotes] = useState(order?.internalNotes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("usps");

  if (!order) {
    return (
      <div className="py-16 text-center text-faded-foreground">
        <p className="font-heading text-xl tracking-wider">Order not found</p>
      </div>
    );
  }

  const isRefunded = order.status === "refunded";
  const subtotal = order.items.reduce((s, i) => s + i.priceCentsSnapshot * i.quantity, 0);
  const shipping = order.amountTotalCents ? order.amountTotalCents - subtotal : null;

  async function handleFulfillment(
    status: "unfulfilled" | "fulfilled" | "shipped",
    trackingNumber?: string,
    trackingCarrier?: string,
  ) {
    setSaving(true);
    try {
      const updated = await updateFulfillmentFn({
        data: { orderId: order!.id, fulfillmentStatus: status, trackingNumber, trackingCarrier },
      });
      if (updated) setOrder({ ...order!, ...updated });
      setShowShipModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleNotesSave() {
    setNotesSaving(true);
    try {
      await updateOrderNotesFn({ data: { orderId: order!.id, notes } });
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleRefund() {
    setRefundError("");
    setRefunding(true);
    try {
      const updated = await refundOrderFn({ data: { orderId: order!.id } });
      if (updated) setOrder({ ...order!, ...updated });
      setShowRefundConfirm(false);
    } catch (err) {
      setRefundError(err instanceof Error ? err.message : "Refund failed. Please try again.");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Ship Dialog */}
      <Dialog
        open={showShipModal}
        onOpenChange={(open) => {
          if (!open) setShowShipModal(false);
        }}
      >
        <DialogContent side="center">
          <DialogHeader>
            <DialogTitle>Mark as shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <FieldLabel>Carrier</FieldLabel>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger asChild>
                  <Button variant="outline" className={formButtonClass}>
                    <SelectValue />
                    <ChevronDown className="size-4" />
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Tracking number</FieldLabel>
              <Input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="1Z999AA10123456784"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => handleFulfillment("shipped", tracking, carrier)}
            >
              {saving ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revert Confirm Dialog */}
      <Dialog open={showRevertConfirm} onOpenChange={setShowRevertConfirm}>
        <DialogContent side="center">
          <DialogHeader>
            <DialogTitle>Revert to unfulfilled</DialogTitle>
          </DialogHeader>
          <p className="text-secondary-foreground text-sm">
            This will clear the fulfillment and shipping data from the order.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => {
                setShowRevertConfirm(false);
                handleFulfillment("unfulfilled");
              }}
            >
              Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Confirm Dialog */}
      <Dialog open={showRefundConfirm} onOpenChange={setShowRefundConfirm}>
        <DialogContent side="center">
          <DialogHeader>
            <DialogTitle>Refund this order?</DialogTitle>
          </DialogHeader>
          <p className="text-secondary-foreground text-sm">
            This issues a full refund through Stripe for{" "}
            <strong>
              {order.amountTotalCents ? formatCents(order.amountTotalCents) : "this order"}
            </strong>{" "}
            and marks the order as refunded. This cannot be undone.
          </p>
          {refundError && <p className="text-red-600 text-sm">{refundError}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" disabled={refunding} onClick={handleRefund}>
              {refunding ? "Refunding…" : "Refund order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isRefunded && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <strong>Warning:</strong> This order has been refunded. Do not ship.
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <FieldLabel>Order ID</FieldLabel>
          <p className="select-text break-all font-mono text-foreground text-sm">{order.id}</p>
        </div>
        <div className="flex gap-2">
          <PaymentBadge status={order.status} />
          <FulfillmentBadge status={order.fulfillmentStatus} />
        </div>
      </div>

      <div className="grid select-text gap-6 md:grid-cols-2">
        {/* Customer */}
        <InfoCard title="Customer">
          <div className="space-y-2 text-sm">
            <div>
              <FieldLabel>Email</FieldLabel>
              <p className="text-foreground">
                {order.customerEmail ?? "—"}
                {order.customerEmail && <CopyButton value={order.customerEmail} />}
              </p>
            </div>
            {order.shippingAddress && (
              <div>
                <p className="flex items-center text-faded-foreground text-xs tracking-wider">
                  Shipping address
                  <CopyButton
                    value={[
                      order.shippingName,
                      order.shippingAddress.line1,
                      order.shippingAddress.line2,
                      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}`,
                      order.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  />
                </p>
                <address className="mt-1 text-foreground not-italic leading-relaxed">
                  {order.shippingName}
                  <br />
                  {order.shippingAddress.line1}
                  <br />
                  {order.shippingAddress.line2 && (
                    <>
                      {order.shippingAddress.line2}
                      <br />
                    </>
                  )}
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postal_code}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Timeline */}
        <InfoCard title="Timeline">
          <div className="space-y-2 text-sm">
            <TimelineRow label="Ordered" value={formatDate(order.createdAt)} />
            <TimelineRow
              label="Paid"
              value={
                order.paidAt
                  ? formatDate(order.paidAt)
                  : // Fallback for orders paid before paidAt was tracked.
                    order.status === "paid" || order.status === "refunded"
                    ? formatDate(order.updatedAt)
                    : "—"
              }
            />
            {order.refundedAt && (
              <TimelineRow label="Refunded" value={formatDate(order.refundedAt)} />
            )}
            <TimelineRow label="Fulfilled" value={formatDate(order.fulfilledAt)} />
            <TimelineRow label="Shipped" value={formatDate(order.shippedAt)} />
            {order.trackingNumber && (
              <TimelineRow
                label={`Tracking (${order.trackingCarrier ?? ""})`}
                value={order.trackingNumber}
              />
            )}
          </div>
        </InfoCard>
      </div>

      {/* Line items */}
      <section className="border border-border bg-background">
        <div className="border-border border-b bg-muted px-4 py-2">
          <h2 className="font-heading text-foreground text-sm tracking-wider">Items</h2>
        </div>
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, i) => (
              <TableRow key={item.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}>
                <TableCell>{item.nameSnapshot}</TableCell>
                <TableCell>{item.sizeSnapshot}</TableCell>
                <TableCell className="tabular-nums">{item.quantity}</TableCell>
                <TableCell className="tabular-nums">
                  {formatCents(item.priceCentsSnapshot * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-border border-t px-4 py-3 text-sm">
          <div className="flex justify-between text-secondary-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCents(subtotal)}</span>
          </div>
          {shipping !== null && shipping > 0 && (
            <div className="flex justify-between text-secondary-foreground">
              <span>Shipping</span>
              <span className="tabular-nums">{formatCents(shipping)}</span>
            </div>
          )}
          {order.amountTotalCents && (
            <div className="mt-1 flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCents(order.amountTotalCents)}</span>
            </div>
          )}
        </div>
      </section>

      {/* Payment actions */}
      <InfoCard title="Payment">
        {order.status === "refunded" ? (
          <p className="text-secondary-foreground text-sm">
            Refunded{order.refundedAt ? ` on ${formatDate(order.refundedAt)}` : ""}.
          </p>
        ) : order.status === "paid" ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={refunding}
              onClick={() => {
                setRefundError("");
                setShowRefundConfirm(true);
              }}
            >
              Refund order
            </Button>
            <span className="text-faded-foreground text-xs">
              Issues a full refund through Stripe.
            </span>
          </div>
        ) : (
          <p className="text-secondary-foreground text-sm">
            Awaiting payment — no charge to refund yet.
          </p>
        )}
      </InfoCard>

      {/* Fulfillment actions — one-way state machine: unfulfilled → fulfilled →
          shipped, with Revert as the only way back. You can't re-run a step
          you're already past. */}
      <InfoCard title="Fulfillment">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={saving || isRefunded || order.fulfillmentStatus !== "unfulfilled"}
            title={
              isRefunded
                ? "Order is refunded"
                : order.fulfillmentStatus === "fulfilled"
                  ? "Already fulfilled"
                  : order.fulfillmentStatus === "shipped"
                    ? "Order has shipped — revert first to change"
                    : undefined
            }
            onClick={() => handleFulfillment("fulfilled")}
          >
            {saving ? "Saving…" : "Mark fulfilled"}
          </Button>
          <Button
            size="sm"
            disabled={saving || isRefunded || order.fulfillmentStatus === "shipped"}
            title={
              isRefunded
                ? "Order is refunded — do not ship"
                : order.fulfillmentStatus === "shipped"
                  ? "Already shipped"
                  : undefined
            }
            onClick={() => setShowShipModal(true)}
          >
            Mark shipped
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={saving || order.fulfillmentStatus === "unfulfilled"}
            title={
              order.fulfillmentStatus === "unfulfilled" ? "Order is already unfulfilled" : undefined
            }
            onClick={() => setShowRevertConfirm(true)}
          >
            Revert to unfulfilled
          </Button>
        </div>
      </InfoCard>

      {/* Internal notes */}
      <InfoCard
        title="Internal notes"
        trailing={
          notesSaving && (
            <span className="ml-2 font-normal text-faded-foreground text-xs">Saving…</span>
          )
        }
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesSave}
          rows={4}
          placeholder="Private notes for the owner…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm outline-none placeholder:text-faded-foreground focus-visible:border-primary"
        />
      </InfoCard>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-faded-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
