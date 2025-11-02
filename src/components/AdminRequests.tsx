import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/glass/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface RequestLog {
  id: number;
  licenseKey?: string | null;
  productId?: number | null;
  ip?: string | null;
  hwid?: string | null;
  macAddress?: string | null;
  operatingSystem?: string | null;
  requestType?: string | null;
  responseType?: string | null;
  requestDate?: string | null;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const AdminRequests = () => {
  const [rows, setRows] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchJson('/.netlify/functions/sunlicense?action=requests');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Validation Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading}>Refresh</Button>
        </div>
        {error && <div className="text-red-300">{error}</div>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>HWID</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.licenseKey || '—'}</TableCell>
                  <TableCell>{r.productId ?? '—'}</TableCell>
                  <TableCell>{r.ip || '—'}</TableCell>
                  <TableCell className="font-mono text-xs break-all">{r.hwid || '—'}</TableCell>
                  <TableCell>{r.operatingSystem || '—'}</TableCell>
                  <TableCell>{r.requestType || '—'}</TableCell>
                  <TableCell>{r.responseType || '—'}</TableCell>
                  <TableCell>{r.requestDate || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRequests;


