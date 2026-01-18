import { PackageClient } from "@/components/store/PackageClient";

export const metadata = {
  title: "Package",
};

export default function PackagePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-5xl">
      <PackageClient packageId={params.id} />
    </div>
  );
}

