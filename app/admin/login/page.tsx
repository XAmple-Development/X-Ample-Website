"use client";

import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && data.success) {
      // Full navigation ensures the session cookie is sent on the next request.
      window.location.assign("/admin/vacancies");
      return;
    }
    setError(data.error || "Login failed.");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Content admin</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to manage vacancies, portfolio, team, and newsletter subscribers.
      </p>

      {configured === false ? (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Content admin is not configured. Set <code className="text-foreground">CONTENT_ADMIN_SECRET</code> in your
          environment (minimum 8 characters), then restart the dev server.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={configured === false}
            className="xa-input mt-2"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || configured === false}
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-xs text-muted">
        Blog and JSON page content are managed separately via{" "}
        <a href="/cms" className="text-accent underline hover:text-accent-hover">
          Decap CMS
        </a>{" "}
        (GitHub login — production only unless using{" "}
        <a
          href="https://decapcms.org/docs/working-with-a-local-git-repository/"
          className="text-accent underline hover:text-accent-hover"
          target="_blank"
          rel="noreferrer"
        >
          local backend
        </a>
        ).
      </p>
    </div>
  );
}
