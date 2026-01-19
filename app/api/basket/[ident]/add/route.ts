import { NextResponse } from "next/server";
import { hasTebexAuthEnv, getBasicAuthHeader } from "@/lib/tebex";

export const runtime = "nodejs";

type AddRequest = {
  package_id: number | string;
  quantity?: number;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ident: string }> },
) {
  if (!hasTebexAuthEnv()) {
    return NextResponse.json(
      {
        error:
          "Missing Tebex env vars. Set TEBEX_PUBLIC_TOKEN and TEBEX_PRIVATE_KEY.",
      },
      { status: 500 },
    );
  }

  let ident: string;
  let body: AddRequest | null;

  try {
    ident = (await params).ident;
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read route params", detail: String(e) },
      { status: 500 },
    );
  }

  try {
    body = (await req.json().catch(() => null)) as AddRequest | null;
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to parse request body", detail: String(e) },
      { status: 400 },
    );
  }

  if (!body?.package_id) {
    return NextResponse.json(
      { error: "Missing required field: package_id" },
      { status: 400 },
    );
  }

  const auth = getBasicAuthHeader();

  if (!auth) {
    return NextResponse.json({ error: "Missing auth header" }, { status: 500 });
  }

  const pkgId = Number(body.package_id);
  if (!Number.isFinite(pkgId) || pkgId <= 0) {
    return NextResponse.json(
      { error: `Invalid package_id: ${String(body.package_id)}` },
      { status: 400 },
    );
  }

  // Tebex Headless (basket-scoped): POST /api/baskets/{ident}/packages
  const url = `https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages`;
  const payload = {
    package_id: pkgId,
    quantity: typeof body.quantity === "number" ? body.quantity : 1,
  };

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
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

    // Keep response tiny to avoid Netlify/edge issues.
    res.body?.cancel?.();
    return NextResponse.json({ ok: true, ident }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Tebex fetch failed", detail: msg },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

