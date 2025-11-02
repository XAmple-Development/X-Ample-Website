import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/glass/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface Product {
  id: number;
  name: string;
  productType: string;
  description?: string | null;
  url?: string | null;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const AdminProductsManager = () => {
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceHealthy, setServiceHealthy] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true); setError(null); setProducts([]);
    try {
      const url = productId.trim() ? `/.netlify/functions/sunlicense?action=products&id=${encodeURIComponent(productId.trim())}` : '/.netlify/functions/sunlicense?action=products';
      const data = await fetchJson(url);
      setProducts(Array.isArray(data) ? data : data?.id ? [data] : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => {
      try { const res = await fetch('/.netlify/functions/sunlicense?action=ping&timeout=2000'); setServiceHealthy(res.ok); } catch { setServiceHealthy(false); }
    })();
    load();
  }, []);

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Optional Product ID" value={productId} onChange={e => setProductId(e.target.value)} />
          <Button onClick={load} disabled={loading || serviceHealthy === false}>Load</Button>
        </div>
        {serviceHealthy === false && <div className="text-yellow-300 text-sm">Licensing service offline. Loading disabled.</div>}
        {error && <div className="text-red-300">{error}</div>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.productType}</TableCell>
                  <TableCell className="max-w-xl whitespace-pre-wrap">{p.description || '—'}</TableCell>
                  <TableCell>{p.url ? <a className="underline" href={p.url} target="_blank" rel="noreferrer">Open</a> : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProductsManager;


