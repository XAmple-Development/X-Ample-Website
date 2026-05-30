"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BUDGET_BANDS, PROJECT_TYPES, TIMELINES } from "@/lib/site";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      projectType: (form.elements.namedItem("projectType") as HTMLSelectElement).value,
      budget: (form.elements.namedItem("budget") as HTMLSelectElement).value,
      timeline: (form.elements.namedItem("timeline") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };
    if (!data.name || !data.email || !data.message) {
      setStatus("error");
      setErrorMessage("Please fill in name, email, and message.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <input name="name" required disabled={status === "sending"} className="xa-input" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required disabled={status === "sending"} className="xa-input" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Project type">
          <select name="projectType" disabled={status === "sending"} className="xa-input">
            <option value="">Select…</option>
            {PROJECT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget">
          <select name="budget" disabled={status === "sending"} className="xa-input">
            <option value="">Select…</option>
            {BUDGET_BANDS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Timeline">
          <select name="timeline" disabled={status === "sending"} className="xa-input">
            <option value="">Select…</option>
            {TIMELINES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Message">
        <textarea name="message" required rows={6} disabled={status === "sending"} className="xa-input" />
      </Field>

      {status === "success" && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Thanks! Your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
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
