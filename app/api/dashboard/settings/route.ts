import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const displayName = typeof form.get("display_name") === "string" ? String(form.get("display_name")).trim() : "";
  const discordTag = typeof form.get("discord_tag") === "string" ? String(form.get("discord_tag")).trim() : "";

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const upd = await sb
    .from("users")
    .update({
      display_name: displayName || null,
      discord_tag: discordTag || null,
      updated_at: now,
    })
    .eq("id", session.userId);

  if (upd.error) return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });

  // Redirect back for form POSTs.
  return NextResponse.redirect(new URL("/dashboard/settings?saved=1", req.url), 303);
}

