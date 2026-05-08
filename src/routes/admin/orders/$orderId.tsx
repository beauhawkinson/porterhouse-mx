import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrderFn, updateFulfillmentFn, updateOrderNotesFn } from "@/lib/server/admin";
import { FulfillmentBadge, PaymentBadge } from "@/routes/admin/index";

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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 text-[#999] text-xs underline hover:text-[#6B4423]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function OrderDetailPage() {
  const initialOrder = Route.useLoaderData();
  const [order, setOrder] = useState(initialOrder);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(order?.internalNotes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("usps");

  if (!order) {
    return (
      <div className="py-16 text-center text-[#999]">
        <p className="font-heading text-xl">ORDER NOT FOUND</p>
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
            <DialogTitle>Mark as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="mb-1 block text-[#999] text-xs uppercase tracking-wider">Carrier</p>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger className="w-full border border-[#e5e0d8] px-3 py-2 text-[#333] text-sm">
                  <SelectValue />
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
              <p className="mb-1 block text-[#999] text-xs uppercase tracking-wider">
                Tracking Number
              </p>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="1Z999AA10123456784"
                className="w-full border border-[#e5e0d8] px-3 py-2 text-[#333] text-sm placeholder:text-[#bbb]"
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
            <DialogTitle>Revert to Unfulfilled</DialogTitle>
          </DialogHeader>
          <p className="text-[#555] text-sm">
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

      {isRefunded && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <strong>Warning:</strong> This order has been refunded. Do not ship.
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-[#999] text-xs uppercase tracking-wider">Order ID</p>
          <p className="break-all font-mono text-[#333] text-sm">{order.id}</p>
        </div>
        <div className="flex gap-2">
          <PaymentBadge status={order.status} />
          <FulfillmentBadge status={order.fulfillmentStatus} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer */}
        <section className="border border-[#e5e0d8] bg-white p-4">
          <h2 className="mb-3 font-heading text-[#333] text-sm tracking-wider">CUSTOMER</h2>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-[#999] text-xs uppercase tracking-wider">Email</p>
              <p className="text-[#333]">
                {order.customerEmail ?? "—"}
                {order.customerEmail && <CopyButton value={order.customerEmail} />}
              </p>
            </div>
            {order.shippingAddress && (
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wider">
                  Shipping Address
                  <CopyButton
                    value={[
                      order.shippingName,
                      order.shippingAddress.line1,
                      order.shippingAddress.line2,
                      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}`,
                      order.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  />
                </p>
                <address className="mt-1 text-[#333] not-italic leading-relaxed">
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
                  {order.shippingAddress.postal}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
            )}
          </div>
        </section>

        {/* Order dates */}
        <section className="border border-[#e5e0d8] bg-white p-4">
          <h2 className="mb-3 font-heading text-[#333] text-sm tracking-wider">TIMELINE</h2>
          <div className="space-y-2 text-sm">
            <TimelineRow p="Ordered" value={formatDate(order.createdAt)} />
            <TimelineRow
              p="Paid"
              value={
                order.status === "paid" || order.status === "fulfilled"
                  ? formatDate(order.updatedAt)
                  : "—"
              }
            />
            <TimelineRow p="Fulfilled" value={formatDate(order.fulfilledAt)} />
            <TimelineRow p="Shipped" value={formatDate(order.shippedAt)} />
            {order.trackingNumber && (
              <TimelineRow
                p={`Tracking (${order.trackingCarrier?.toUpperCase() ?? ""})`}
                value={order.trackingNumber}
              />
            )}
          </div>
        </section>
      </div>

      {/* Line items */}
      <section className="border border-[#e5e0d8] bg-white">
        <div className="border-[#e5e0d8] border-b bg-[#f5f0eb] px-4 py-2">
          <h2 className="font-heading text-[#333] text-sm tracking-wider">ITEMS</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-[#e5e0d8] border-b">
              <th className="px-4 py-2 text-left text-[#999] text-xs uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-2 text-left text-[#999] text-xs uppercase tracking-wider">
                Size
              </th>
              <th className="px-4 py-2 text-right text-[#999] text-xs uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-2 text-right text-[#999] text-xs uppercase tracking-wider">
                Line Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-[#e5e0d8] border-b last:border-0">
                <td className="px-4 py-2 text-[#333]">{item.nameSnapshot}</td>
                <td className="px-4 py-2 text-[#555]">{item.sizeSnapshot}</td>
                <td className="px-4 py-2 text-right text-[#555]">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-[#333]">
                  {formatCents(item.priceCentsSnapshot * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-[#e5e0d8] border-t px-4 py-3 text-sm">
          <div className="flex justify-between text-[#555]">
            <span>Subtotal</span>
            <span>{formatCents(subtotal)}</span>
          </div>
          {shipping !== null && shipping > 0 && (
            <div className="flex justify-between text-[#555]">
              <span>Shipping</span>
              <span>{formatCents(shipping)}</span>
            </div>
          )}
          {order.amountTotalCents && (
            <div className="mt-1 flex justify-between font-semibold text-[#111]">
              <span>Total</span>
              <span>{formatCents(order.amountTotalCents)}</span>
            </div>
          )}
        </div>
      </section>

      {/* Fulfillment actions */}
      <section className="border border-[#e5e0d8] bg-white p-4">
        <h2 className="mb-3 font-heading text-[#333] text-sm tracking-wider">FULFILLMENT</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={saving || order.fulfillmentStatus === "fulfilled"}
            onClick={() => handleFulfillment("fulfilled")}
          >
            {saving ? "Saving…" : "Mark Fulfilled"}
          </Button>
          <Button
            size="sm"
            disabled={saving || isRefunded}
            onClick={() => setShowShipModal(true)}
            title={isRefunded ? "Order is refunded — do not ship" : undefined}
          >
            Mark Shipped
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={saving || order.fulfillmentStatus === "unfulfilled"}
            onClick={() => setShowRevertConfirm(true)}
          >
            Revert to Unfulfilled
          </Button>
        </div>
      </section>

      {/* Internal notes */}
      <section className="border border-[#e5e0d8] bg-white p-4">
        <h2 className="mb-2 font-heading text-[#333] text-sm tracking-wider">
          INTERNAL NOTES
          {notesSaving && <span className="ml-2 font-normal text-[#999] text-xs">Saving…</span>}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesSave}
          rows={4}
          placeholder="Private notes for the owner…"
          className="w-full border border-[#e5e0d8] px-3 py-2 text-[#333] text-sm placeholder:text-[#bbb] focus:border-[#8B5A2B] focus:outline-none"
        />
      </section>
    </div>
  );
}

function TimelineRow({ p, value }: { p: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#999]">{p}</span>
      <span className="text-[#333]">{value}</span>
    </div>
  );
}
