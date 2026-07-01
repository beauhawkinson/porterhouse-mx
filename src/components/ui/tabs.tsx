import clsx from "clsx";
import { Tabs as TabsPrimitive } from "radix-ui";

import type * as React from "react";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={clsx("space-y-6", className)} {...props} />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={clsx("flex items-center gap-1 border-border border-b", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={clsx(
        "-mb-px cursor-pointer border-transparent border-b-2 px-4 py-2 font-heading text-faded-foreground text-sm tracking-wider transition-colors",
        "hover:text-foreground focus-visible:outline-none",
        "data-[state=active]:border-primary data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={clsx("focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
