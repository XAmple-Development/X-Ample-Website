import { NextResponse } from "next/server";
import { hasTebexAuthEnv, getBasicAuthHeader } from "@/lib/tebex";

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

  const auth = getBasicAuthHeader();

  try {
    const pkgId = Number(body.package_id);
    if (!Number.isFinite(pkgId) || pkgId <= 0) {
      return NextResponse.json(
        { error: `Invalid package_id: ${String(body.package_id)}` },
        { status: 400 },
      );
    }

    // Tebex Headless (basket-scoped): PUT /api/baskets/{ident}/packages/{packageId}
    const url = `https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages/${encodeURIComponent(String(pkgId))}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: auth!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ quantity: body.quantity }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Tebex returned ${res.status}`,
          tebex_status: res.status,
          tebex_response: text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    res.body?.cancel?.();
    return NextResponse.json({ ok: true, ident }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Tebex fetch failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}

