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
  const [serviceHealthy, setServiceHealthy] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true); setError(null); setCustomers([]);
    try {
      const trimmed = filter.trim();
      if (!trimmed) {
        setError('Enter an email or Discord ID to search');
        setLoading(false);
        return;
      }
      let licenses: any[] = [];
      if (trimmed.includes('@')) {
        const data = await fetchJson(`/.netlify/functions/sunlicense?action=licenses&email=${encodeURIComponent(trimmed)}`);
        licenses = Array.isArray(data) ? data : [];
      } else {
        const data = await fetchJson(`/.netlify/functions/sunlicense?action=licenses&discordId=${encodeURIComponent(trimmed)}`);
        licenses = Array.isArray(data) ? data : [];
      }
      if (!licenses.length) {
        setCustomers([]);
        return;
      }
      // Derive customer record from any license fields
      const any = licenses[0] || {};
      const derived: Customer = {
        id: any.customer?.id || 0,
        username: any.customer?.username || any.ownerDiscordUsername || null,
        email: any.customer?.email || null,
        phoneNumber: any.customer?.phoneNumber || null,
        discordId: any.ownerDiscordId || null,
        discordUsername: any.ownerDiscordUsername || null,
      };
      setCustomers([derived]);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => { try { const res = await fetch('/.netlify/functions/sunlicense?action=ping&timeout=2000'); setServiceHealthy(res.ok); } catch { setServiceHealthy(false); } })();
  }, []);

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Filter by email/discord/username" value={filter} onChange={e => setFilter(e.target.value)} />
          <Button onClick={load} disabled={loading || serviceHealthy === false}>Search</Button>
        </div>
        {serviceHealthy === false && <div className="text-yellow-300 text-sm">Licensing service offline. Search disabled.</div>}
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


