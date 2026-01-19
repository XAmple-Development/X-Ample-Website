import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type Body = {
  packageId: number;
  quantity?: number;

  /**
   * Map of tebex variable id -> user value
   * Example:
   *  { "123456": "Danny#1234" }
   * or
   *  { "123456": "123456789012345678" }
   */
  variableValues?: Record<string, string>;
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
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

    // Build variable_values in Tebex format if provided
    let variable_values: Array<{ variable_id: number; value: string }> | undefined;

    if (body.variableValues !== undefined) {
      if (!isRecord(body.variableValues)) {
        return NextResponse.json(
          { error: "variableValues must be an object of { [variableId]: value }" },
          { status: 400 },
        );
      }

      variable_values = Object.entries(body.variableValues)
        .map(([variableId, value]) => ({
          variable_id: Number(variableId),
          value: typeof value === "string" ? value : String(value),
        }))
        .filter((x) => Number.isFinite(x.variable_id) && x.variable_id > 0 && x.value.trim().length > 0);

      // If they passed variableValues but it became empty after filtering, treat as error
      if (Object.keys(body.variableValues).length > 0 && variable_values.length === 0) {
        return NextResponse.json(
          { error: "variableValues provided, but none were valid (check variable ids and values)" },
          { status: 400 },
        );
      }
    }

    // Tebex: POST https://headless.tebex.io/api/baskets/{ident}/packages
    const tebexUrl = `https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages`;

    const tebexPayload: Record<string, unknown> = {
      package_id: packageId,
      quantity,
    };

    // Only include variable_values if provided (keeps payload clean)
    if (variable_values && variable_values.length > 0) {
      tebexPayload.variable_values = variable_values;
    }

    const tebexRes = await fetch(tebexUrl, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(tebexPayload),
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
