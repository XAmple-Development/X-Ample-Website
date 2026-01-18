import { CategoryClient } from "@/components/store/CategoryClient";

export const metadata = {
  title: "Category",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <CategoryClient categoryId={id} />
    </div>
  );
}

