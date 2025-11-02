import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type License = {
  id?: number;
  licenseKey?: string;
  productId?: number;
  licenseType?: string;
  licenseStatus?: string;
  ownerDiscordId?: string | null;
  ownerDiscordUsername?: string | null;
  expiryDate?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  notes?: string | null;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  productType: string;
  imageUrl?: string | null;
};

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json();
      const message = data?.error || data?.message || 'Request failed';
      throw new Error(message);
    }
    const text = await res.text();
    if (/Not Found/i.test(text)) throw new Error('Not found');
    throw new Error(text || 'Request failed');
  }
  return contentType.includes('application/json') ? res.json() : { data: await res.text() };
};

const postJson = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json();
      const message = data?.error || data?.message || 'Request failed';
      throw new Error(message);
    }
    throw new Error(await res.text());
  }
  return contentType.includes('application/json') ? res.json() : { data: await res.text() };
};

const LicensePage = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [validateProductId, setValidateProductId] = useState("");
  const [ip, setIp] = useState("");
  const [hwid, setHwid] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [productId, setProductId] = useState("");

  const [license, setLicense] = useState<License | null>(null);
  const [validateResult, setValidateResult] = useState<any>(null);
  const [validatedProductName, setValidatedProductName] = useState<string | null>(null);
  const [validatedOwner, setValidatedOwner] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckByKey = async () => {
    setLoading(true); setError(null); setLicense(null); setValidateResult(null);
    try {
      // Prefer v1 validate as some instances do not expose v2 license-by-key
      const payload: Record<string, unknown> = { licenseKey: licenseKey.trim() };
      if (validateProductId.trim()) payload.productId = Number(validateProductId.trim());
      if (ip.trim()) payload.ip = ip.trim();
      if (hwid.trim()) payload.hwid = hwid.trim();
      if (macAddress.trim()) payload.macAddress = macAddress.trim();
      const data = await postJson(`/.netlify/functions/sunlicense?action=validate`, payload);
      setValidateResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to validate license");
    } finally { setLoading(false); }
  };

  const handleProducts = async () => {
    setLoading(true); setError(null); setProducts([]);
    try {
      const url = productId.trim()
        ? `/.netlify/functions/sunlicense?action=products&id=${encodeURIComponent(productId.trim())}`
        : `/.netlify/functions/sunlicense?action=products`;
      const data = await fetchJson(url);
      setProducts(Array.isArray(data) ? data : data?.id ? [data] : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch products");
    } finally { setLoading(false); }
  };

  // When a validate result arrives, derive productName and owner details if present
  useEffect(() => {
    const deriveOwner = (res: any): string | null => {
      if (!res) return null;
      // Common fields we might get back from validate
      const discordUser = res.ownerDiscordUsername || res.discordUsername || res.customerDiscordUsername;
      const discordId = res.ownerDiscordId || res.discordId || res.customerDiscordId;
      const email = res.customerEmail || res.email;
      if (discordUser && discordId) return `${discordUser} (${discordId})`;
      if (discordUser) return String(discordUser);
      if (discordId) return String(discordId);
      if (email) return String(email);
      return null;
    };

    setValidatedOwner(deriveOwner(validateResult));

    async function fetchProductName(productId: any) {
      try {
        const id = Number(productId);
        if (!id || Number.isNaN(id)) {
          setValidatedProductName(null);
          return;
        }
        const data = await fetchJson(`/.netlify/functions/sunlicense?action=products&id=${encodeURIComponent(String(id))}`);
        setValidatedProductName(data?.name || null);
      } catch {
        setValidatedProductName(null);
      }
    }

    if (validateResult?.productId != null) {
      fetchProductName(validateResult.productId);
    } else {
      setValidatedProductName(null);
    }
  }, [validateResult]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />

      <section className="pt-24 pb-10 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white">License Center</h1>
          <p className="text-gray-300 mt-3">Check and verify your licenses and view product details.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-6 grid grid-cols-1 gap-8">
          <Card className="bg-gray-900 text-gray-100 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Verify License by Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Enter license key" value={licenseKey} onChange={e => setLicenseKey(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
                <Button onClick={handleCheckByKey} disabled={loading || !licenseKey.trim()} className="bg-cyan-600 hover:bg-cyan-500">Verify</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input placeholder="Product ID (optional)" value={validateProductId} onChange={e => setValidateProductId(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
                <Input placeholder="IP (optional)" value={ip} onChange={e => setIp(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
                <Input placeholder="HWID (optional)" value={hwid} onChange={e => setHwid(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
                <Input placeholder="MAC Address (optional)" value={macAddress} onChange={e => setMacAddress(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
              </div>
              {loading && <p className="text-gray-400">Loading...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {license && (
                <div className="text-sm text-gray-200 space-y-1">
                  <p><strong>Key:</strong> {license.licenseKey}</p>
                  <p><strong>Status:</strong> {license.licenseStatus}</p>
                  <p><strong>Type:</strong> {license.licenseType}</p>
                  <p><strong>Product ID:</strong> {license.productId}</p>
                  <p><strong>Owner:</strong> {license.ownerDiscordUsername || license.ownerDiscordId || 'N/A'}</p>
                  <p><strong>Expiry:</strong> {license.expiryDate || 'N/A'}</p>
                </div>
              )}
              {validateResult && (
                <div className={`text-sm rounded p-3 border space-y-1 ${validateResult?.status === 200 ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'}`}>
                  <div>{validateResult?.message || (validateResult?.status === 200 ? 'License validated' : 'Request failed')}</div>
                  {validateResult?.status === 200 && (
                    <div className="text-gray-300">
                      {validatedProductName && (
                        <div><strong>Product:</strong> {validatedProductName} {validateResult?.productId ? `(ID: ${validateResult.productId})` : ''}</div>
                      )}
                      {!validatedProductName && validateResult?.productId != null && (
                        <div><strong>Product ID:</strong> {validateResult.productId}</div>
                      )}
                      {validatedOwner && (
                        <div><strong>Customer:</strong> {validatedOwner}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 text-gray-100 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Optional Product ID" value={productId} onChange={e => setProductId(e.target.value)} className="bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-cyan-500" />
                <Button onClick={handleProducts} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500">Load</Button>
              </div>
              {!!products.length && (
                <div className="overflow-x-auto text-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">ID</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-gray-200">{p.id}</TableCell>
                          <TableCell className="text-gray-200">{p.name}</TableCell>
                          <TableCell className="text-gray-200">{p.productType}</TableCell>
                          <TableCell className="max-w-xl whitespace-pre-wrap text-gray-200">{p.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LicensePage;


