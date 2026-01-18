import { StoreClient } from "@/components/store/StoreClient";

export const metadata = {
  title: "Store",
};

export default function StorePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Store</h1>
        <p className="text-foreground/75">
          Browse packages from our Tebex store. Checkout is handled securely by
          Tebex.
        </p>
      </div>
      <div className="mt-8">
        <StoreClient />
      </div>
    </div>
  );
}

