export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        Have a question, need support, or want custom work? Send a message and
        we’ll get back to you.
      </p>

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        className="mt-8 space-y-4"
      >
        <input type="hidden" name="form-name" value="contact" />

        <Field label="Name">
          <input
            name="name"
            required
            className="h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35"
          />
        </Field>

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            className="h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35"
          />
        </Field>

        <Field label="Message">
          <textarea
            name="message"
            required
            rows={6}
            className="w-full rounded-xl border border-black/15 bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35"
          />
        </Field>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Send message
        </button>
      </form>
    </div>
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

