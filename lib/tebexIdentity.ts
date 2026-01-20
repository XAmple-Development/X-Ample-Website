/**
 * Best-effort extraction of a stable user identity from Tebex basket payloads.
 *
 * The exact shape varies by Tebex product + auth type (FiveM, etc), so we search
 * common locations and provide fallbacks.
 */
export type TebexIdentity = {
  tebexCustomerId: string;
  username?: string | null;
  email?: string | null;
};

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

function asIdString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s || s === "null" || s === "undefined") return null;
    return s;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(Math.trunc(v));
  return null;
}

export function extractTebexIdentity(basketPayload: any): TebexIdentity | null {
  const root = basketPayload?.data ?? basketPayload;

  // Prefer stable numeric customer id if present.
  const customerId =
    asIdString(root?.customer?.id) ??
    asIdString(root?.customer?.customer_id) ??
    asIdString(root?.customer_id) ??
    asIdString(root?.player?.customer_id) ??
    asIdString(root?.player?.id);

  const username =
    asNonEmptyString(root?.player?.username) ??
    asNonEmptyString(root?.player?.name) ??
    asNonEmptyString(root?.customer?.username) ??
    asNonEmptyString(root?.customer?.name) ??
    asNonEmptyString(root?.username) ??
    null;

  const email =
    asNonEmptyString(root?.customer?.email) ??
    asNonEmptyString(root?.email) ??
    null;

  if (customerId) {
    return { tebexCustomerId: customerId, username, email };
  }

  // Last-resort: some payloads only expose a FiveM identifier/uuid.
  const fivem =
    asIdString(root?.player?.uuid) ??
    asIdString(root?.player?.identifier) ??
    asIdString(root?.player?.fivem_id) ??
    asIdString(root?.player?.fivemId);
  if (fivem) {
    return { tebexCustomerId: `fivem:${fivem}`, username, email };
  }

  return null;
}

