import type { ReactNode } from "react";

/**
 * Shared shell for the legal/policy pages so they read as one set.
 * Child content is plain <section><h2>…</h2><p>…</p></section> blocks —
 * styling for headings and links is applied here via descendant selectors.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl text-foreground uppercase tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-2 text-faded-foreground text-sm">Last updated {updated}</p>

      <div className="mt-10 select-text space-y-8 text-secondary-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:uppercase [&_h2]:tracking-wide [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
