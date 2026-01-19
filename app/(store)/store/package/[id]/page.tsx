import PackageClient from "./package-client";

export default function PackagePage({
  params,
}: {
  params: { id?: string; packageId?: string; slug?: string };
}) {
  const id = params.id ?? params.packageId ?? params.slug;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <PackageClient id={id} />
    </main>
  );
}
