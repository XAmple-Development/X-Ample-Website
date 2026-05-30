"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <input name="name" required disabled={status === "sending"} className="xa-input" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required disabled={status === "sending"} className="xa-input" />
      </Field>
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
