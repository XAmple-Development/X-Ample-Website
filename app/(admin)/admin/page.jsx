import { cookies } from "next/headers";
import { Anchor, Container, Group, Image, Stack, Text, Title } from "@mantine/core";
import AdminLogin from "../../../components/admin/AdminLogin";
import AdminPanel from "../../../components/admin/AdminPanel";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | PrismMC",
  description: "Manage store settings, content and blog posts.",
};

export default async function Page() {
  const jar = cookies();
  const pass = jar.get("admin-pass")?.value || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  const authed = expected && pass === expected;

  return (
    <Container my="xl" size={1400}>
      <Anchor mb="0.6rem" display="block" c="bright" component={Link} href="/">
        <Group gap="0.4rem">
          <TbArrowLeft />
          <Text>Exit admin</Text>
        </Group>
      </Anchor>
      <Image mb="1rem" src="/hero_bg.png" alt="Admin" w="100%" mah="20rem" radius={4} />
      {authed ? <AdminPanel /> : <AdminLogin />}
    </Container>
  );
}


