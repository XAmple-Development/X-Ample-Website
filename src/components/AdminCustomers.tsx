import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/glass/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface Customer {
  id: number;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  discordId?: string | null;
  discordUsername?: string | null;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchJson('/.netlify/functions/sunlicense?action=customers');
      const arr = Array.isArray(data) ? data : [];
      const trimmed = filter.trim().toLowerCase();
      const filtered = trimmed ? arr.filter((c: any) =>
        String(c.email || '').toLowerCase().includes(trimmed) ||
        String(c.discordId || '').includes(trimmed) ||
        String(c.discordUsername || '').toLowerCase().includes(trimmed) ||
        String(c.username || '').toLowerCase().includes(trimmed)
      ) : arr;
      setCustomers(filtered);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Filter by email/discord/username" value={filter} onChange={e => setFilter(e.target.value)} />
          <Button onClick={load} disabled={loading}>Refresh</Button>
        </div>
        {error && <div className="text-red-300">{error}</div>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Discord</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.username || '—'}</TableCell>
                  <TableCell>{c.email || '—'}</TableCell>
                  <TableCell>{c.discordUsername ? `${c.discordUsername} (${c.discordId || ''})` : (c.discordId || '—')}</TableCell>
                  <TableCell>{c.phoneNumber || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCustomers;


