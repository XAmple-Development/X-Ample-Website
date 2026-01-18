import { cookies } from "next/headers";
import { Container } from "@mantine/core";
import BlogEditor from "../../../../../components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Blog Post | Admin | PrismMC",
  description: "Create a new blog post for your store blog.",
};

export default async function Page() {
  const jar = cookies();
  const pass = jar.get("admin-pass")?.value || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  const authed = expected && pass === expected;
  if (!authed) return null;
  return (
    <Container mt="5rem" size={900}>
      <BlogEditor />
    </Container>
  );
}


