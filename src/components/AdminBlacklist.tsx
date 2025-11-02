import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/glass/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface BlacklistEntry {
  id: number;
  licenseDataType: 'IP' | 'HWID';
  data: string;
  isForAllProducts: boolean;
  productId?: number | null;
  reason?: string | null;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const postJson = async (url: string, body: unknown) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const AdminBlacklist = () => {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseDataType, setLicenseDataType] = useState<'IP' | 'HWID'>('HWID');
  const [data, setData] = useState('');
  const [reason, setReason] = useState('');
  const [productId, setProductId] = useState('');
  const [allProducts, setAllProducts] = useState(true);
  const [serviceHealthy, setServiceHealthy] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchJson('/.netlify/functions/sunlicense?action=blacklists');
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { try { const res = await fetch('/.netlify/functions/sunlicense?action=ping&timeout=2000'); setServiceHealthy(res.ok); } catch { setServiceHealthy(false); } })();
    load();
  }, []);

  const add = async () => {
    if (!data.trim()) return;
    setLoading(true); setError(null);
    try {
      const payload: any = { licenseDataType, data: data.trim(), isForAllProducts: allProducts, reason: reason.trim() || 'blocked' };
      if (!allProducts && productId.trim()) payload.productId = Number(productId.trim());
      await postJson('/.netlify/functions/sunlicense?action=blacklistAdd', payload);
      setData(''); setReason('');
      load();
    } catch (e: any) {
      setError(e.message || 'Failed to add');
    } finally { setLoading(false); }
  };

  const remove = async (id: number) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/.netlify/functions/sunlicense?action=blacklistDelete&id=${id}`);
      if (!res.ok) throw new Error(await res.text());
      load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally { setLoading(false); }
  };

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Blacklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Select value={licenseDataType} onValueChange={v => setLicenseDataType(v as any)}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="HWID">HWID</SelectItem>
              <SelectItem value="IP">IP</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Value (HWID/IP)" value={data} onChange={e => setData(e.target.value)} />
          <Input placeholder="Product ID (optional)" value={productId} onChange={e => { setProductId(e.target.value); setAllProducts(!e.target.value.trim()); }} />
          <Input placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={add} disabled={loading || !data.trim() || serviceHealthy === false}>Add to Blacklist</Button>
          <Button variant="secondary" onClick={load} disabled={loading || serviceHealthy === false}>Refresh</Button>
        </div>
        {serviceHealthy === false && <div className="text-yellow-300 text-sm">Licensing service offline. Actions disabled.</div>}
        {error && <div className="text-red-300">{error}</div>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.id}</TableCell>
                  <TableCell>{e.licenseDataType}</TableCell>
                  <TableCell className="font-mono text-xs break-all">{e.data}</TableCell>
                  <TableCell>{e.isForAllProducts ? 'All' : 'Product'}</TableCell>
                  <TableCell>{e.productId ?? '—'}</TableCell>
                  <TableCell>{e.reason ?? '—'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => remove(e.id)} disabled={serviceHealthy === false}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBlacklist;


