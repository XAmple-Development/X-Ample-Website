"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };
    if (!data.name || !data.email || !data.message) {
      setStatus("error");
      setErrorMessage("Please fill in all fields.");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(typeof json.error === "string" ? json.error : "Something went wrong. Please try again or email us directly.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Field label="Name">
        <input
          name="name"
          required
          disabled={status === "sending"}
          className="h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 disabled:opacity-60 dark:border-white/15 dark:focus:border-white/35"
        />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          disabled={status === "sending"}
          className="h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 disabled:opacity-60 dark:border-white/15 dark:focus:border-white/35"
        />
      </Field>
      <Field label="Message">
        <textarea
          name="message"
          required
          rows={6}
          disabled={status === "sending"}
          className="w-full rounded-xl border border-black/15 bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-black/40 disabled:opacity-60 dark:border-white/15 dark:focus:border-white/35"
        />
      </Field>

      {status === "success" && (
        <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-800 dark:text-green-200">
          Thanks! Your message has been sent. We’ll get back to you soon.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
