import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { listBlogPosts, readBlogPostSource } from "@/lib/blog";
import { siteBaseUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = await readBlogPostSource(slug);
  if (!source) return { title: "Post" };
  const title = String(source.frontmatter?.title ?? slug);
  const excerpt = typeof source.frontmatter?.excerpt === "string" ? source.frontmatter.excerpt : undefined;
  const date = String(source.frontmatter?.date ?? "");
  const path = `/blog/${encodeURIComponent(slug)}`;
  const description = excerpt || `Read ${title} on the X-Ample Development blog.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · Blog · X-Ample Development`,
      description,
      type: "article",
      url: path,
      publishedTime: date || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · X-Ample Development`,
      description,
    },
  };
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
  const excerpt = typeof source.frontmatter?.excerpt === "string" ? source.frontmatter.excerpt : undefined;

  const compiled = await compileMDX({
    source: source.content,
    components: mdxComponents,
  });

  const baseUrl = siteBaseUrl();
  const articleUrl = `${baseUrl}/blog/${encodeURIComponent(slug)}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt || title,
    url: articleUrl,
    datePublished: date || undefined,
    publisher: { "@type": "Organization", name: "X-Ample Development", url: baseUrl },
  };

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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

