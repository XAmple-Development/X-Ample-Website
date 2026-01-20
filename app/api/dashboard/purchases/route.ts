import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("purchases")
    .select("id, tebex_payment_id, total, currency, created_at, purchase_items(id, name, quantity, price, currency)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Failed to load purchases" }, { status: 500 });
  return NextResponse.json({ data: data ?? [] }, { status: 200 });
}

