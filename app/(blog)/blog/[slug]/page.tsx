import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { listBlogPosts, readBlogPostSource } from "@/lib/blog";

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = await readBlogPostSource(slug);
  if (!source) notFound();

  const title = String(source.frontmatter?.title ?? slug);
  const date = String(source.frontmatter?.date ?? "");

  const compiled = await compileMDX({
    source: source.content,
    components: mdxComponents,
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/blog"
        className="text-sm text-foreground/70 underline underline-offset-4 decoration-black/25 hover:text-foreground dark:decoration-white/25"
      >
        Back to blog
      </Link>

      <h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {date ? (
        <p className="mt-3 text-sm text-foreground/70">{date}</p>
      ) : null}

      <div className="mt-8">{compiled.content}</div>
    </article>
  );
}

