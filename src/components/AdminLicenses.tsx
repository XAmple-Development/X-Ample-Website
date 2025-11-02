import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/glass/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

interface License {
  id?: number;
  licenseKey?: string;
  productId?: number;
  licenseType?: string;
  licenseStatus?: string;
  ownerDiscordId?: string | null;
  ownerDiscordUsername?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  expiryDate?: string | null;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const postJson = async (url: string, body: unknown) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = ct.includes('application/json') ? JSON.stringify(await res.json()) : await res.text();
    throw new Error(text || 'Request failed');
  }
  return ct.includes('application/json') ? res.json() : res.text();
};

const AdminLicenses = () => {
  const [email, setEmail] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingKey, setValidatingKey] = useState<string | null>(null);
  const [validateMsg, setValidateMsg] = useState<string | null>(null);

  const loadByEmail = async () => {
    setLoading(true); setError(null); setLicenses([]);
    try {
      const data = await fetchJson(`/.netlify/functions/sunlicense?action=licenses&email=${encodeURIComponent(email.trim())}`);
      setLicenses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  const loadByDiscord = async () => {
    setLoading(true); setError(null); setLicenses([]);
    try {
      const data = await fetchJson(`/.netlify/functions/sunlicense?action=licenses&discordId=${encodeURIComponent(discordId.trim())}`);
      setLicenses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  const validate = async (licenseKey?: string, productId?: number) => {
    if (!licenseKey) return;
    setValidatingKey(licenseKey); setValidateMsg(null);
    try {
      const payload: Record<string, unknown> = { licenseKey };
      if (productId) payload.productId = productId;
      const result = await postJson('/.netlify/functions/sunlicense?action=validate&format=text', payload);
      setValidateMsg(String(result));
    } catch (e: any) {
      setValidateMsg(e.message || 'Validation failed');
    } finally { setValidatingKey(null); }
  };

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Licenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <Input placeholder="Search by email" value={email} onChange={e => setEmail(e.target.value)} />
            <Button onClick={loadByEmail} disabled={loading || !email.trim()}>Search</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Search by Discord ID" value={discordId} onChange={e => setDiscordId(e.target.value)} />
            <Button onClick={loadByDiscord} disabled={loading || !discordId.trim()}>Search</Button>
          </div>
        </div>

        {error && <div className="text-red-300">{error}</div>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map(l => (
                <TableRow key={l.id || l.licenseKey}>
                  <TableCell className="font-mono text-xs">{l.licenseKey}</TableCell>
                  <TableCell>{l.licenseStatus}</TableCell>
                  <TableCell>{l.licenseType}</TableCell>
                  <TableCell>{l.productId}</TableCell>
                  <TableCell>{l.ownerDiscordUsername || l.ownerDiscordId || '—'}</TableCell>
                  <TableCell>{l.expiryDate || '—'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" onClick={() => validate(l.licenseKey, l.productId)} disabled={validatingKey === l.licenseKey}>
                      {validatingKey === l.licenseKey ? 'Validating…' : 'Validate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {validateMsg && (
          <div className="text-sm text-cyan-200">{validateMsg}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLicenses;
