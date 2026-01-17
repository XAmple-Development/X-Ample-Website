import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { TebexProduct } from "@/types/tebex";
import { RefreshCw, ShieldCheck, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    TebexCheckout?: {
      openCheckout: (options: { account: string; package_id: string }) => void;
    };
  }
}

const formatPrice = (price: number, currency?: string) => {
  if (!price && price !== 0) return "";
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "USD",
  });
  return formatter.format(price);
};

const fetchProducts = async (): Promise<TebexProduct[]> => {
  const response = await fetch("/.netlify/functions/tebex-products");
  if (!response.ok) {
    throw new Error("Unable to fetch store products right now.");
  }
  const data = await response.json();
  return (data?.products ?? []) as TebexProduct[];
};

const Store = () => {
  const { toast } = useToast();
  const accountToken = import.meta.env.VITE_TEBEX_ACCOUNT_TOKEN as string | undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [tebexReady, setTebexReady] = useState(false);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["tebex-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

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

  // Load Tebex embedded checkout script (Safari-safe URL)
  useEffect(() => {
    if (!accountToken) return;

    if (window.TebexCheckout) {
      setTebexReady(true);
      return;
    }

    const SRC = "https://js.tebex.io/v/1.js";

    const existing = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      // If it already loaded previously, mark ready
      if ((existing as any)._tebexLoaded) {
        setTebexReady(true);
        return;
      }
      existing.addEventListener("load", () => setTebexReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => {
      (script as any)._tebexLoaded = true;
      setTebexReady(true);
    };
    script.onerror = () => setTebexReady(false);
    document.body.appendChild(script);
  }, [accountToken]);

  const handleCheckout = (product: TebexProduct) => {
    if (!accountToken) {
      toast({ title: "Tebex token missing", description: "Set VITE_TEBEX_ACCOUNT_TOKEN" });
      return;
    }
    if (!window.TebexCheckout) {
      toast({ title: "Tebex not ready", description: "Retry in a moment." });
      return;
    }

    setIsSubmitting(true);
    try {
      window.TebexCheckout.openCheckout({
        account: accountToken,
        package_id: String(product.id),
      });
    } catch (err: any) {
      console.error("Tebex checkout error", err);
      toast({ title: "Checkout failed", description: err?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
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
                  Tebex Products. <span className="text-cyan-300">Pay through Tebex.</span>
                </h1>
                <p className="text-lg text-slate-200 max-w-2xl">
                  Browse every product from your Tebex store and check out securely on Tebex for
                  automatic fulfillment.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                    Protected payments
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                    <Wallet className="w-4 h-4 text-cyan-300" />
                    PayPal checkout
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
                    Seamless checkout
                  </CardTitle>
                  <CardDescription className="text-slate-200">
                    We’ll fetch prices straight from Tebex and send you to their secure checkout for
                    fulfillment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white/10 text-cyan-200 border-cyan-200/30">
                      Live catalog
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-teal-200 border-teal-200/30">
                      Tebex checkout
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-200">
                    Want to pay another way? Reach out on Discord and we’ll help you out.
                  </p>

                  {!accountToken && (
                    <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
                      Missing <span className="font-semibold">VITE_TEBEX_ACCOUNT_TOKEN</span> — checkout
                      will be disabled.
                    </div>
                  )}

                  {accountToken && !tebexReady && (
                    <div className="text-xs text-slate-200 bg-white/5 border border-white/10 rounded-md px-3 py-2">
                      Loading Tebex checkout…
                    </div>
                  )}
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
                          <Badge className="bg-cyan-500/20 text-cyan-100 border-cyan-500/40">
                            {product.category ?? "General"}
                          </Badge>
                          {product.recurring && (
                            <Badge variant="outline" className="text-teal-100 border-teal-200/40">
                              {product.recurring}
                            </Badge>
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

                        <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                          onClick={() => handleCheckout(product)}
                          disabled={isSubmitting || !accountToken || !tebexReady}
                        >
                          {isSubmitting
                            ? "Starting..."
                            : !accountToken
                              ? "Set Tebex token"
                              : !tebexReady
                                ? "Loading Tebex..."
                                : "Checkout via Tebex"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
