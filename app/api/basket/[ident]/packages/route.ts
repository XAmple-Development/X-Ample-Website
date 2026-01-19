import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type Body = { packageId: number; quantity?: number };

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function basicAuthHeader() {
  const username = mustEnv("TEBEX_PUBLIC_TOKEN");
  const password = mustEnv("TEBEX_PRIVATE_KEY");
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ident: string }> },
) {
  try {
    const { ident } = await context.params;

    let body: Partial<Body> = {};
    try {
      body = (await req.json()) as Partial<Body>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const packageId = Number(body.packageId);
    const quantity = Math.max(1, Number(body.quantity ?? 1));

    if (!Number.isFinite(packageId) || packageId <= 0) {
      return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
    }

    // Tebex: POST https://headless.tebex.io/api/baskets/{ident}/packages
    const tebexUrl = `https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages`;

    const tebexRes = await fetch(tebexUrl, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        package_id: packageId,
        quantity,
      }),
    });

    const raw = await tebexRes.text();
    let data: unknown = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // keep as text
    }

    // IMPORTANT: return Tebex status/body as-is so you can see real reason (403/422/etc)
    if (!tebexRes.ok) {
      return NextResponse.json(
        {
          error: "Tebex rejected add-to-basket",
          tebexStatus: tebexRes.status,
          tebexBody: data,
        },
        { status: tebexRes.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
