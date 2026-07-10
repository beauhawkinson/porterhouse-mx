import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";

/** Branded 404 shown for unmatched routes. Renders inside the app shell. */
export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-heading text-primary text-sm uppercase tracking-[0.3em]">404</p>
      <h1 className="mt-4 font-heading text-4xl text-foreground uppercase tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link to="/" size="md">
          Back home
        </Link>
        <Link to="/shop" variant="outline" size="md">
          Shop
        </Link>
      </div>
    </div>
  );
}

/** Route-level error boundary. `reset` retries the failed render. */
export function RouteError({ error, reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();

  const handleRetry = () => {
    reset?.();
    router.invalidate();
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-heading text-primary text-sm uppercase tracking-[0.3em]">Error</p>
      <h1 className="mt-4 font-heading text-4xl text-foreground uppercase tracking-tight sm:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-muted-foreground">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={handleRetry} size="md">
          Try again
        </Button>
        <Link to="/" variant="outline" size="md">
          Back home
        </Link>
      </div>
    </div>
  );
}
