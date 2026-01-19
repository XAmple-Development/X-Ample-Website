export const metadata = {
  title: "Cart",
};

import { CartClient } from "@/components/store/CartClient";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
        <p className="text-foreground/75">
          Review your basket and continue to checkout.
        </p>
      </div>

      <div className="mt-8">
        <CartClient />
      </div>
    </div>
  );
}

