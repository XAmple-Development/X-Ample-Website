/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TebexProduct } from "@/types/tebex";
import { RefreshCw, ShieldCheck, ShoppingBag, Sparkles, Wallet, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fetchProducts = async (): Promise<TebexProduct[]> => {
  const response = await fetch("/.netlify/functions/tebex-products");
  if (!response.ok) {
    throw new Error("Unable to fetch store products right now.");
  }
  const data = await response.json();
  return (data?.products ?? []) as TebexProduct[];
};

const formatPrice = (price: number, currency?: string) => {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "USD",
  }).format(price);
};

const Store = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [tebexUsernameId, setTebexUsernameId] = useState("");
  const [tebexBasketIdent, setTebexBasketIdent] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState("");

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["tebex-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast({ title: "Checkout complete", description: "Thanks! Tebex will process your order." });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("status") === "cancelled") {
      toast({ title: "Checkout cancelled", description: "You can resume anytime." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    const stored = window.localStorage.getItem("storeCart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCartItems(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("storeCart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("store-cart-updated"));
  }, [cartItems]);

  useEffect(() => {
    const stored = window.localStorage.getItem("tebexBasketIdent");
    if (stored) setTebexBasketIdent(stored);
    const user = window.localStorage.getItem("tebexUsernameId");
    if (user) setTebexUsernameId(user);
    const token = window.localStorage.getItem("tebexLoginToken");
    if (token) setSessionToken(token);
  }, []);

  useEffect(() => {
    if (tebexBasketIdent) {
      window.localStorage.setItem("tebexBasketIdent", tebexBasketIdent);
    }
    if (tebexUsernameId) {
      window.localStorage.setItem("tebexUsernameId", tebexUsernameId);
    }
    if (sessionToken) {
      window.localStorage.setItem("tebexLoginToken", sessionToken);
    }
  }, [tebexBasketIdent, tebexUsernameId, sessionToken]);

  useEffect(() => {
    const sync = async () => {
      if ((!tebexUsernameId && !sessionToken) || cartItems.length === 0) return;
      try {
        const res = await fetch("/.netlify/functions/tebex-basket-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ident: tebexBasketIdent,
            usernameId: tebexUsernameId || undefined,
            sessionToken: sessionToken || undefined,
            items: cartItems,
          }),
        });
        const payload = await res.json();
        if (!res.ok) return;
        if (payload?.ident) setTebexBasketIdent(payload.ident);
        if (typeof payload?.count === "number") {
          window.localStorage.setItem("tebexBasketCount", String(payload.count));
          window.dispatchEvent(new Event("store-cart-updated"));
        }
      } catch {
        // ignore sync errors
      }
    };

    sync();
  }, [cartItems, tebexBasketIdent, tebexUsernameId, sessionToken]);
  const handleLogin = () => {
    const token = sessionToken || crypto.randomUUID();
    setSessionToken(token);
    window.localStorage.setItem("tebexLoginToken", token);
    const returnUrl = encodeURIComponent(`${window.location.origin}/store?cart=1`);
    window.location.href = `https://checkout.tebex.io/login/${process.env.REACT_APP_TEBEX_ACCOUNT_TOKEN || ""}?return_url=${returnUrl}&reference=${encodeURIComponent(token)}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("cart") === "1") {
      setCartOpen(true);
      params.delete("cart");
      const nextSearch = params.toString();
      const nextUrl = `${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("store-cart-open", open);
    return () => window.removeEventListener("store-cart-open", open);
  }, []);

  const categories = useMemo(() => {
    if (!products?.length) return ["All"];
    const set = new Set<string>();
    products.forEach((item) => {
      if (item.category) set.add(String(item.category));
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || String(product.category ?? "General") === activeCategory;
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add products before checkout." });
      return;
    }
    if (!tebexUsernameId && !sessionToken) {
      toast({ title: "Login required", description: "Please login via Tebex first." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/.netlify/functions/tebex-basket-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          usernameId: tebexUsernameId || undefined,
          sessionToken: sessionToken || undefined,
          returnUrl: `${window.location.origin}/store?status=success`,
          cancelUrl: `${window.location.origin}/store?status=cancelled`,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "Unable to start Tebex checkout.");
      }
      window.location.href = payload.checkoutUrl;
    } catch (err: any) {
      console.error("Tebex checkout error", err);
      toast({ title: "Checkout failed", description: err?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartDetailed = useMemo(() => {
    if (!products) return [];
    const map = new Map(products.map((p) => [String(p.id), p]));
    return cartItems
      .map((item) => {
        const product = map.get(String(item.productId));
        if (!product) return null;
        const unitPrice = product.salePrice ?? product.price;
        return {
          product,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
        };
      })
      .filter(Boolean) as Array<{
      product: TebexProduct;
      quantity: number;
      lineTotal: number;
    }>;
  }, [cartItems, products]);

  const cartTotal = useMemo(() => {
    return cartDetailed.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [cartDetailed]);

  const addToCart = (product: TebexProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.productId) === String(product.id));
      if (existing) {
        return prev.map((item) =>
          String(item.productId) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: String(product.id), quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          String(item.productId) === String(productId)
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => String(item.productId) !== String(productId)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -left-24 -top-24 w-80 h-80 bg-cyan-500 rounded-full blur-3xl" />
            <div className="absolute right-10 top-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-teal-100">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  Official X-Ample Store
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
                  Tebex Products. <span className="text-cyan-300">Headless Checkout.</span>
                </h1>
                <p className="text-lg text-slate-200 max-w-2xl">
                  Products are listed from Tebex. Checkout is handled by Tebex via the Headless API.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                    Protected payments
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                    <Wallet className="w-4 h-4 text-cyan-300" />
                    Tebex checkout
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                    <RefreshCw className="w-4 h-4 text-cyan-300" />
                    Live Tebex pricing
                  </div>
                </div>
              </div>

              <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white w-full lg:w-[420px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-300" />
                    Tebex Checkout
                  </CardTitle>
                  <CardDescription className="text-slate-200">
                    We create a Tebex basket and redirect you to checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-slate-200 bg-white/5 border border-white/10 rounded-md px-3 py-2">
                    Enter your Tebex username_id inside the basket to sync items.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    className={cn(
                      "rounded-full",
                      activeCategory === category
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0"
                        : "border-white/20 text-white hover:border-cyan-300/60 hover:text-cyan-100"
                    )}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="w-full md:w-72">
                <input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <Skeleton className="h-4 w-32 bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-6 w-3/4 bg-white/10" />
                      <Skeleton className="h-12 w-full bg-white/10" />
                      <Skeleton className="h-10 w-full bg-white/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">Couldn’t load products</p>
                  <p className="text-sm opacity-80">Please try again or refresh the page.</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => refetch()}
                  className="bg-white text-red-600 hover:bg-slate-100"
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <Card className="bg-white/5 border-white/10 text-center py-10">
                <CardHeader>
                  <CardTitle>No products match your filters</CardTitle>
                  <CardDescription className="text-slate-200">
                    Try removing filters or check back later.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {!isLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const displayPrice = product.salePrice ?? product.price;
                  const hasSale = product.salePrice && product.salePrice < product.price;
                  return (
                    <Card
                      key={product.id}
                      className="bg-white/5 border-white/10 backdrop-blur-sm flex flex-col"
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/20 text-cyan-100 text-xs font-semibold">
                            {product.category ?? "General"}
                          </div>
                          {product.recurring && (
                            <div className="px-3 py-1 rounded-full border border-teal-200/40 bg-white/5 text-teal-100 text-xs font-semibold">
                              {product.recurring}
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <CardDescription className="text-slate-200 line-clamp-3">
                          {product.description || "No description provided."}
                        </CardDescription>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-cyan-300">
                            {formatPrice(displayPrice, product.currency)}
                          </span>
                          {hasSale && (
                            <span className="text-sm text-slate-400 line-through">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        {product.image && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-white/30 text-white hover:border-cyan-300 hover:text-cyan-100"
                            onClick={() => addToCart(product)}
                          >
                            Add to Basket
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                            onClick={() => addToCart(product)}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-slate-950 border border-white/10 rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Basket</h2>
              <Button variant="ghost" onClick={() => setCartOpen(false)}>
                Close
              </Button>
            </div>
            {cartDetailed.length === 0 ? (
              <p className="text-slate-300">Your basket is empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Tebex username_id (required to sync Tebex basket)
                  </label>
                    <input
                    value={tebexUsernameId}
                    onChange={(e) => setTebexUsernameId(e.target.value)}
                    placeholder="Enter username_id"
                    className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:border-cyan-300 hover:text-cyan-100 w-full mt-2"
                      onClick={handleLogin}
                    >
                      Login with Tebex
                    </Button>
                </div>
                {cartDetailed.map(({ product, quantity, lineTotal }) => (
                  <div key={product.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-400">
                        {formatPrice(product.salePrice ?? product.price, product.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => updateQuantity(String(product.id), -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-6 text-center">{quantity}</span>
                      <Button variant="outline" onClick={() => updateQuantity(String(product.id), 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => removeFromCart(String(product.id))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      {formatPrice(lineTotal, product.currency)}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatPrice(cartTotal, cartDetailed[0]?.product.currency)}</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Starting..." : "Checkout via Tebex"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Store;
