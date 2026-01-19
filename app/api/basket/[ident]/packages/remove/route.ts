import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type Body = {
  /** Basket line item id (NOT package id) */
  basketPackageId: number;
};

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

    const body = (await req.json()) as Partial<Body>;
    const basketPackageId = Number(body.basketPackageId);

    if (!Number.isFinite(basketPackageId) || basketPackageId <= 0) {
      return NextResponse.json({ error: "Invalid basketPackageId" }, { status: 400 });
    }

    // Tebex: POST /api/baskets/{ident}/packages/remove
    const tebexUrl = `https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages/remove`;

    const tebexRes = await fetch(tebexUrl, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        package_id: basketPackageId, // IMPORTANT: this is the basket item id in most Tebex responses
      }),
    });

    const raw = await tebexRes.text();
    let data: unknown = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // keep as text
    }

    if (!tebexRes.ok) {
      return NextResponse.json(
        { error: "Tebex rejected remove", tebexStatus: tebexRes.status, tebexBody: data },
        { status: tebexRes.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
