import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { submitProductRequestFn } from "@/lib/server/product-requests";

type State = "idle" | "submitting" | "done" | "error";

export function ProductRequest() {
  const { isSignedIn } = useRouteContext({ from: "__root__" });
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setError(null);
    try {
      await submitProductRequestFn({ data: { message } });
      setMessage("");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  };

  return (
    <section className="mx-auto mb-32 max-w-2xl px-6 text-center">
      <div className="flex items-center justify-center gap-4">
        <span aria-hidden className="h-10 w-1.5 shrink-0 bg-primary" />
        <h2 className="font-moto_is_life text-5xl text-foreground leading-none sm:text-6xl">
          Request a product
        </h2>
      </div>
      <p className="mt-4 text-muted-foreground">
        Got a design or piece of gear you want us to make? Tell us what to build next.
      </p>

      <div className="mt-8">
        {!isSignedIn ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-secondary-foreground text-sm">Sign in to send a request.</p>
            <Link to="/sign-in" size="md">
              Sign in
            </Link>
          </div>
        ) : state === "done" ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-heading text-foreground text-lg">Request received — thank you!</p>
            <Button variant="outline" size="sm" onClick={() => setState("idle")}>
              Request another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
              rows={7}
              placeholder="e.g. A long-sleeve jersey in team blue, sizes up to XXL"
              className="min-h-44 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-foreground text-sm outline-none focus-visible:border-primary"
            />
            <div className="flex items-center justify-between gap-4">
              <span className="text-faded-foreground text-xs">{message.trim().length}/1000</span>
              <Button
                type="submit"
                size="md"
                disabled={state === "submitting" || message.trim().length < 10}
              >
                {state === "submitting" ? "Sending…" : "Send request"}
              </Button>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
