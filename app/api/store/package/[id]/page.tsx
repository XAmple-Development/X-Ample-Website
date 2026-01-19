import PackageClient from "./package-client";

export default function PackagePage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <PackageClient id={params.id} />
    </main>
  );
}
