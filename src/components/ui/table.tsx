import type * as React from "react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full">
      <table
        data-slot="table"
        className="h-full w-full table-auto caption-bottom rounded-lg"
        {...props}
      />
    </div>
  );
}

function TableHeader({ ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className="sticky top-0 z-0 shadow-[0_1px_0_0_var(--color-border)]"
      {...props}
    />
  );
}

function TableBody({ ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className="border-t bg-muted/50 font-medium [&>tr]:last:border-b-0"
      {...props}
    />
  );
}

function TableRow({ ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className="border-b transition-colors last:border-b-0 hover:bg-muted/50 data-[state=selected]:bg-muted data-[static=true]:hover:bg-transparent [&:last-child>td:first-child]:rounded-bl-xl [&:last-child>td:last-child]:rounded-br-xl"
      {...props}
    />
  );
}

function TableHead({ ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className="h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-xs [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5"
      {...props}
    />
  );
}

function TableCell({ ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className="whitespace-nowrap px-2 py-3 align-middle text-secondary-foreground text-xs [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5"
      {...props}
    />
  );
}

function TableCaption({ ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className="mt-4 text-muted-foreground" {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
