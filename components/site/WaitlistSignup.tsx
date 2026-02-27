"use client";

import { useState } from "react";

export function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-background p-8 dark:border-white/10 sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-xl font-semibold">Join the waitlist</h2>
        <p className="mt-2 text-sm text-foreground/75">
          Be the first to hear about new releases, updates, and early access.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "sending"}
            className="h-11 min-w-0 flex-1 rounded-full border border-black/15 bg-background px-4 text-sm outline-none ring-0 focus:border-black/40 disabled:opacity-60 dark:border-white/15 dark:focus:border-white/35 sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-11 shrink-0 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending" ? "Joining…" : "Join"}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-4 text-sm text-green-700 dark:text-green-300">You’re on the list. We’ll be in touch.</p>
        )}
        {status === "error" && message && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
}
