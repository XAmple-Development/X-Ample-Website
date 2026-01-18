import { cookies } from "next/headers";
import { Container } from "@mantine/core";
import { getSettings } from "../../../../../../utils/settingsServer";
import BlogEditor from "../../../../../../components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Blog Post | Admin | PrismMC",
  description: "Edit an existing blog post on your store blog.",
};

export default async function Page({ params }) {
  const jar = cookies();
  const pass = jar.get("admin-pass")?.value || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  const authed = expected && pass === expected;
  if (!authed) return null;
  const { slug } = await params;
  const settings = await getSettings();
  const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
  const post = posts.find(p => (p.id || p.slug) === slug) || null;
  return (
    <Container size={900}>
      <BlogEditor initialPost={post} />
    </Container>
  );
}


