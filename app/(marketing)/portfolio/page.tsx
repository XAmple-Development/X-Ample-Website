export const metadata = {
  title: "Portfolio",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        A curated view of shipped work. This page will be CMS-editable in the
        next step so you can add projects without touching code.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Scripts">Modern gameplay systems and utilities.</Card>
        <Card title="MLOs">High-fidelity interiors & environments.</Card>
        <Card title="UI">Clean, readable interfaces with great UX.</Card>
        <Card title="Support">Fast iteration, fixes, and improvements.</Card>
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

