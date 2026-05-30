"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
    <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Newsletter</p>
        <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Get studio updates</h2>
        <p className="mt-2 text-sm text-muted">
          Project news, blog posts, and studio announcements — no spam, just the good stuff.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={status === "sending"}
            className="xa-input h-11 min-w-0 flex-1 rounded-full sm:max-w-xs"
          />
          <Button type="submit" variant="primary" disabled={status === "sending"} className="shrink-0">
            {status === "sending" ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
        {status === "success" && (
          <p className="mt-4 text-sm text-green-400">You&apos;re subscribed. We&apos;ll be in touch.</p>
        )}
        {status === "error" && message && (
          <p className="mt-4 text-sm text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
}
