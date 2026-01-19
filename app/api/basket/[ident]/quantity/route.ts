import { NextResponse } from "next/server";
import { hasTebexAuthEnv, getBasicAuthHeader, getWebstoreToken } from "@/lib/tebex";

export const runtime = "nodejs";

type UpdateQuantityRequest = {
  package_id: number | string;
  quantity: number;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ ident: string }> },
) {
  if (!hasTebexAuthEnv()) {
    return NextResponse.json(
      { error: "Missing Tebex env vars. Set TEBEX_PUBLIC_TOKEN and TEBEX_PRIVATE_KEY." },
      { status: 500 },
    );
  }

  let ident: string;
  let body: UpdateQuantityRequest | null;

  try {
    ident = (await params).ident;
  } catch (e) {
    return NextResponse.json({ error: "Failed to read route params", detail: String(e) }, { status: 500 });
  }

  try {
    body = (await req.json().catch(() => null)) as UpdateQuantityRequest | null;
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse request body", detail: String(e) }, { status: 400 });
  }

  if (!body?.package_id || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "Missing required fields: package_id, quantity" }, { status: 400 });
  }

  const token = getWebstoreToken();
  const auth = getBasicAuthHeader();

  // Tebex Headless: PUT /api/accounts/{token}/baskets/{ident}/packages/{packageId}
  const url = `https://headless.tebex.io/api/accounts/${encodeURIComponent(token!)}/baskets/${encodeURIComponent(ident)}/packages/${encodeURIComponent(String(body.package_id))}`;

  let res: Response;
  let text: string;

  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: auth!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ quantity: body.quantity }),
    });
    text = await res.text();
  } catch (e) {
    return NextResponse.json({ error: "Tebex fetch failed", detail: String(e) }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Tebex returned ${res.status}`, tebex_status: res.status, tebex_response: text.slice(0, 500) },
      { status: 502 },
    );
  }

  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: 200 });
  } catch {
    return NextResponse.json({ raw: text }, { status: 200 });
  }
}

