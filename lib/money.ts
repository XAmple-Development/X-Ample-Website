export function formatCurrency(amount: number | null | undefined, currency?: string | null) {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "";
  const c =
    typeof currency === "string" && /^[A-Z]{3}$/i.test(currency.trim())
      ? currency.trim().toUpperCase()
      : "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

