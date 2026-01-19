import StoreClient from "./store-client";

export const runtime = "nodejs";

export default function StorePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Store</h1>
      <p className="mt-2 text-sm opacity-80">
        Browse packages, add to basket, then checkout.
      </p>

      <div className="mt-8">
        <StoreClient />
      </div>
    </main>
  );
}
