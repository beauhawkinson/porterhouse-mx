import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProductForm } from "@/components/products/ProductForm";
import Link from "@/components/ui/link";
import { createProductFn } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/products/new")({
  component: ProductCreatePage,
});

function ProductCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" variant="muted" size="none">
          ← Back
        </Link>
        <h2 className="font-heading text-foreground text-xl tracking-wider">New product</h2>
      </div>

      <section className="max-w-2xl border border-border bg-background p-4">
        <h3 className="mb-4 font-heading text-foreground text-sm tracking-wider">
          Product details
        </h3>
        <ProductForm
          submitLabel="Create product"
          onSubmit={async (values) => {
            const created = await createProductFn({ data: values });
            if (!created?.id) {
              throw new Error("Create failed — no product returned");
            }
            await navigate({
              to: "/admin/products/$productId",
              params: { productId: created.id },
            });
          }}
        />
      </section>
    </div>
  );
}
