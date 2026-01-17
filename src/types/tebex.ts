export interface TebexProduct {
  id: number | string;
  name: string;
  description?: string;
  image?: string | null;
  category?: string | number | null;
  price: number;
  salePrice?: number | null;
  currency?: string;
  recurring?: string | null;
}
