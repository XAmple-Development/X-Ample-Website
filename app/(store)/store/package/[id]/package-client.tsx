"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import sanitizeHtml from "sanitize-html";

type Money = { formatted?: string; value?: number; currency?: string };

function pickIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  const id = last.trim();
  if (!id || id === "undefined" || id === "null") return null;
  return id;
}

function priceText(p?: Money) {
  if (!p) return "";
  if (p.formatted) return p.formatted;
  if (typeof p.value === "number") return `£${(p.value / 100).toFixed(2)}`;
  return "";
}

function safeHtmlFromTebex(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "span",
      "br",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
}

export default function PackageClient({ id }: { id?: string }) {
  const pathname = usePathname();

  const effectiveId = useMemo(() => {
    const fromProp = (id ?? "").trim();
    if (fromProp && fromProp !== "undefined" && fromProp !== "null") return fromProp;
    return pickIdFromPath(pathname);
  }, [id, pathname]);

  const [pkg, setPkg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Derive display values safely (even when pkg is null) BEFORE any returns
  const name = (pkg?.name ?? "Package") as string;
  const image = (pkg?.image ?? pkg?.image_url ?? null) as string | null;
  const total = (pkg?.total_price ?? pkg?.price) as Money | undefined;
  const description = (typeof pkg?.description === "string" ? pkg.description : "") as string;

  // ✅ Hook runs on every render (no conditional hook usage)
  const descriptionHtml = useMemo(() => {
    if (!description) return "";
    return safeHtmlFromTebex(description);
  }, [description]);

  useEffect(() => {
    let cancelled = false;

    if (!effectiveId) {
      setError("Missing package id in URL (check your /store links).");
      setPkg(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/store/package/${encodeURIComponent(effectiveId)}`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? `Failed to load package (${res.status})`);

        if (!cancelled) setPkg(json?.data ?? json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveId]);

  if (loading) return <div className="text-sm opacity-60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!pkg) return <div className="text-sm opacity-60">Not found.</div>;

  return (
    <div className="rounded-xl border p-5">
      <a className="text-sm opacity-70 hover:underline" href="/store">
        ← Back to store
      </a>

      <div className="mt-3 text-2xl font-semibold">{name}</div>

      {total ? <div className="mt-2 text-sm font-semibold">{priceText(total)}</div> : null}

      {image ? (
        <img src={image} alt={name} className="mt-4 w-full rounded-xl border object-cover" />
      ) : null}

      {descriptionHtml ? (
        <div
          className="prose prose-invert prose-sm mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <div className="mt-4 text-sm opacity-70">No description provided.</div>
      )}
    </div>
  );
}
