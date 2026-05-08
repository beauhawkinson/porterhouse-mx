import clsx from "clsx";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "./Button";

import type * as React from "react";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay(props: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in"
      {...props}
    />
  );
}

function DialogContent({
  children,
  showCloseButton = true,
  side = "center",
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  side?: "center" | "top" | "bottom" | "left" | "right";
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={clsx(
          "fixed z-50 grid gap-4 border bg-background custom:bg-surface shadow-lg outline-none",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "transition-[transform,opacity] duration-200",
          side === "center" &&
            "top-[50%] left-[50%] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl p-6 sm:max-w-md",
          side === "top" &&
            "inset-x-0 top-[1rem] mx-auto h-auto w-full max-w-[calc(100%-2rem)] rounded-xl p-6 sm:max-w-md",
          side === "bottom" && "inset-x-0 bottom-0 h-auto rounded-t-xl p-6",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 rounded-r-xl p-6 sm:max-w-sm",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 rounded-l-xl p-6 sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild data-slot="dialog-close">
            <Button variant="ghost" className="absolute top-2 right-2 size-6">
              <X className="icon-sm" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader(props: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className="flex flex-col gap-2 text-left" {...props} />;
}

function DialogFooter(props: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      {...props}
    />
  );
}

function DialogTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className="select-none font-semibold text-foreground text-lg leading-none"
      {...props}
    />
  );
}

function DialogDescription(props: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className="select-none text-secondary-foreground"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
