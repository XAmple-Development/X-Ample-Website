import { CategoryClient } from "@/components/store/CategoryClient";

export const metadata = {
  title: "Category",
};

export default function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="mx-auto max-w-5xl">
      <CategoryClient categoryId={id} />
    </div>
  );
}

