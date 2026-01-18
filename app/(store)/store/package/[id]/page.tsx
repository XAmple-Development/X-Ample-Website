import { PackageClient } from "@/components/store/PackageClient";

export const metadata = {
  title: "Package",
};

export default async function PackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <PackageClient packageId={id} />
    </div>
  );
}

