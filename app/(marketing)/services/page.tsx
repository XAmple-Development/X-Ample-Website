export const metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        X-Ample Development builds FiveM assets and custom solutions. If you
        need something bespoke, we can scope it and deliver with clean UX and
        maintainable code.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="FiveM scripts">
          Gameplay systems, UIs, and integrations (ESX / QB / standalone).
        </Card>
        <Card title="MLOs & mapping">
          High-quality interiors and environments built for performance.
        </Card>
        <Card title="UI/UX polish">
          Modern interfaces with consistent patterns and great readability.
        </Card>
        <Card title="Custom work">
          From concept to delivery: features, optimization, and support.
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/75">{children}</p>
    </div>
  );
}

