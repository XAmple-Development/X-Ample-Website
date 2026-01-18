import { cookies } from "next/headers";
import { Container, Stack, TextInput, Button, Textarea } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { NextResponse } from "next/server";

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
    <Container size={900}>
      <Stack>
        <TextInput label="Title" placeholder="Post title" />
        <TextInput label="Slug" placeholder="post-slug" />
        <TextInput label="Feature Image URL" placeholder="/demo-image.png" />
        <Textarea label="Excerpt" placeholder="Short summary" minRows={3} />
        <Textarea label="HTML" placeholder="Paste HTML or markdown-rendered HTML here" minRows={12} />
        <Button size="md">Save</Button>
      </Stack>
    </Container>
  );
}


