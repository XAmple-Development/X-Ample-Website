import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const LicensePage = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [email, setEmail] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [productId, setProductId] = useState("");

  const [license, setLicense] = useState<License | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckByKey = async () => {
    setLoading(true); setError(null); setLicense(null);
    try {
      const data = await fetchJson(`/.netlify/functions/sunlicense?action=licenseByKey&licenseKey=${encodeURIComponent(licenseKey.trim())}`);
      setLicense(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch license");
    } finally { setLoading(false); }
  };

  const handleListByEmail = async () => {
    setLoading(true); setError(null); setLicenses([]);
    try {
      const data = await fetchJson(`/.netlify/functions/sunlicense?action=licensesByEmail&email=${encodeURIComponent(email.trim())}`);
      setLicenses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch licenses");
    } finally { setLoading(false); }
  };

  const handleListByDiscord = async () => {
    setLoading(true); setError(null); setLicenses([]);
    try {
      const data = await fetchJson(`/.netlify/functions/sunlicense?action=licensesByDiscordId&discordId=${encodeURIComponent(discordId.trim())}`);
      setLicenses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch licenses");
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

  return (
    <div className="min-h-screen bg-gray-10">
      <Header />

      <section className="pt-24 pb-10 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900">License Center</h1>
          <p className="text-gray-600 mt-3">Check and verify your licenses and view product details.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Verify License by Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Enter license key" value={licenseKey} onChange={e => setLicenseKey(e.target.value)} />
                <Button onClick={handleCheckByKey} disabled={loading || !licenseKey.trim()}>Verify</Button>
              </div>
              {loading && <p className="text-gray-500">Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {license && (
                <div className="text-sm text-gray-800 space-y-1">
                  <p><strong>Key:</strong> {license.licenseKey}</p>
                  <p><strong>Status:</strong> {license.licenseStatus}</p>
                  <p><strong>Type:</strong> {license.licenseType}</p>
                  <p><strong>Product ID:</strong> {license.productId}</p>
                  <p><strong>Owner:</strong> {license.ownerDiscordUsername || license.ownerDiscordId || 'N/A'}</p>
                  <p><strong>Expiry:</strong> {license.expiryDate || 'N/A'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Find Licenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Customer email" value={email} onChange={e => setEmail(e.target.value)} />
                <Button onClick={handleListByEmail} disabled={loading || !email.trim()}>Search</Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Discord ID" value={discordId} onChange={e => setDiscordId(e.target.value)} />
                <Button onClick={handleListByDiscord} disabled={loading || !discordId.trim()}>Search</Button>
              </div>

              {!!licenses.length && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>License Key</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenses.map((l) => (
                        <TableRow key={l.id || l.licenseKey}>
                          <TableCell className="font-mono text-xs">{l.licenseKey}</TableCell>
                          <TableCell>{l.licenseStatus}</TableCell>
                          <TableCell>{l.licenseType}</TableCell>
                          <TableCell>{l.productId}</TableCell>
                          <TableCell>{l.expiryDate || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 lg:col-span-2">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Optional Product ID" value={productId} onChange={e => setProductId(e.target.value)} />
                <Button onClick={handleProducts} disabled={loading}>Load</Button>
              </div>
              {!!products.length && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.productType}</TableCell>
                          <TableCell className="max-w-xl whitespace-pre-wrap">{p.description}</TableCell>
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


