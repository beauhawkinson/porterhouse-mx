import { Link, useLocation } from "@tanstack/react-router";

import {
  DEFAULT_FEATURED_VARIANT,
  FEATURED_VARIANTS,
  FEATURED_VARIANT_LABELS,
} from "./featured-variants";
import { DEFAULT_HOME_VARIANT, HOME_VARIANTS, HOME_VARIANT_LABELS } from "./variants";

import type { FeaturedVariant } from "./featured-variants";
import type { HomeVariant } from "./variants";

type HomeSearch = { v?: HomeVariant; f?: FeaturedVariant };

const pillClass = (isActive: boolean) =>
  `shrink-0 rounded-full px-2.5 py-0.5 font-medium text-xs transition-colors ${
    isActive ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-muted"
  }`;

function GroupLabel({ children }: { children: string }) {
  return (
    <span className="w-16 shrink-0 font-heading text-[10px] text-faded-foreground uppercase tracking-[0.2em]">
      {children}
    </span>
  );
}

/** Admin-only preview toggles for the home + featured designs (temporary). */
export function PreviewSwitcher() {
  const search = useLocation({ select: (l) => l.search as HomeSearch });
  const activeHome = search.v ?? DEFAULT_HOME_VARIANT;
  const activeFeatured = search.f ?? DEFAULT_FEATURED_VARIANT;

  return (
    <div className="flex flex-col justify-center gap-2.5 py-3">
      <p className="font-heading text-[10px] text-primary uppercase tracking-[0.2em]">
        Testing — please choose your favorite combination
      </p>

      <div className="flex flex-col gap-2 rounded-md border border-border bg-background/60 px-3 py-2.5">
        {/* Home designs */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          <GroupLabel>Home</GroupLabel>
          {HOME_VARIANTS.map((v) => (
            // Preserve the sibling `f` selection when switching home design.
            <Link
              key={v}
              to="/"
              search={{ v, f: search.f }}
              className={pillClass(activeHome === v)}
            >
              {HOME_VARIANT_LABELS[v]}
            </Link>
          ))}
        </div>

        {/* Featured designs */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          <GroupLabel>Featured</GroupLabel>
          {FEATURED_VARIANTS.map((f) => (
            <Link
              key={f}
              to="/"
              search={{ v: search.v, f }}
              className={pillClass(activeFeatured === f)}
            >
              {FEATURED_VARIANT_LABELS[f]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
