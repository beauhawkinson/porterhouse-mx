import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateProductFn } from "@/lib/server/admin";

import type { ProductStatus } from "@/lib/db/schema";

type Props = {
  productId: string;
  productName: string;
  currentStatus: ProductStatus;
};

export function ArchiveProductButton({ productId, productName, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const isArchived = currentStatus === "archived";

  async function handleArchive() {
    setSaving(true);
    try {
      await updateProductFn({
        data: { productId, status: "archived" },
      });
      setOpen(false);
      await navigate({ to: "/admin/products" });
    } finally {
      setSaving(false);
    }
  }

  if (isArchived) {
    return (
      <p className="text-faded-foreground text-sm">
        This product is archived. Change status above to bring it back.
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Archive product
        </Button>
      </DialogTrigger>
      <DialogContent side="center">
        <DialogHeader>
          <DialogTitle>Archive "{productName}"?</DialogTitle>
        </DialogHeader>
        <p className="text-secondary-foreground text-sm">
          Archived products are hidden from the public shop but remain in the database — existing
          orders are not affected. You can un-archive at any time by changing the status back to
          draft or active.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" size="sm" disabled={saving} onClick={handleArchive}>
            {saving ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
