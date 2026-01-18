import { Button, Container, Group, Image, Paper, Stack, Text, Title } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import Link from "next/link";
import { getSettings } from "../../utils/settingsServer";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getSettings();
  const t = await getTranslations("Maintenance");

  if (!settings.general.settings.maintenance_mode) {
    redirect("/");
  }

  return (
    <Container size={900} py={{ base: "4rem", md: "8rem" }}>
      <Paper bg="background_alt" p={{ base: "2rem", md: "4rem" }} bd="1px solid var(--mantine-color-background_alt-5)">
        <Group justify="center" mb="xl">
          <Image src={settings.general.settings.hero_image_url} alt="Logo" mah={120} w="auto" />
        </Group>
        <Stack gap="md" ta="center">
          <Title order={1} c="bright">{t("Title")}</Title>
          <Text fz="lg">
            {t("Description")}
          </Text>
          <Text>
            {t("CheckBackSoon")}
          </Text>
          <Group justify="center" mt="md">
            <Button component={Link} href={settings.social.settings.discord_url} variant="primary" size="md">
              {t("JoinDiscord")}
            </Button>
            <Button component={Link} href="/" variant="light" size="md">
              {t("TryAgain")}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}


