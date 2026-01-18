import { alpha, Anchor, Box, Container, Group, Image, Paper, Text } from "@mantine/core";
import FadeIn from "./FadeIn";
import Navbar from "./Navbar";
import Footer from "./Footer";
import JoinButton from "./JoinButton";
import CopyIPButton from "./CopyIPButton";
import { getSettings } from "../utils/settingsServer";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { TbChevronRight } from "react-icons/tb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SiteShell({ children }) {
  const settings = await getSettings();
  const t = await getTranslations("Hero");

  if (settings?.general?.settings?.maintenance_mode) {
    const expected = process.env.ADMIN_PASSWORD || "";
    const cookie = cookies().get("admin-pass")?.value || "";
    const isAdmin = expected && cookie === expected;
    if (!isAdmin) {
      redirect("/maintenance");
    }
  }

  let discordCount = null;
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${settings.server.settings.server_ip}`);
    const data = await res.json();
    player = data.players?.online?.toLocaleString('en-GB') ?? null;
  } catch {}

  try {
    const discordRes = await fetch(`https://discord.com/api/v9/invites/${settings.social.settings.discord_invite_code}?with_counts=true`);
    const discordData = await discordRes.json();
    discordCount = discordData.profile?.online_count?.toLocaleString('en-GB') ?? null;
  } catch {}

  const pagesData = [
    { label: t("Home"), href: "/", enabled: settings.general.settings.pages.settings.home },
    { label: t("Store"), href: "/store", enabled: settings.general.settings.pages.settings.store },
    { label: t("Vote"), href: "/vote", enabled: settings.general.settings.pages.settings.vote },
    { label: t("Blog"), href: "/blog", enabled: settings.general.settings.pages.settings.blog },
    { label: t("Rules"), href: "/rules", enabled: settings.general.settings.pages.settings.rules },
    { label: t("Wiki"), href: settings.social.settings.links.wiki.url, target: "_blank", enabled: settings.general.settings.pages.settings.wiki }
  ];

  return (
    <FadeIn>
      <Navbar settings={settings} />
      <Box className="hero-section">
        <Container>
          <Group pt="8rem" pb="4rem" pos="relative" style={{ zIndex: 1 }} justify="space-evenly">
            <JoinButton settings={settings}>
              <CopyIPButton settings={settings} copiedIpText={t("CopiedIP")} copyIpText={t("CopyIP")} />
            </JoinButton>
            <Link href="/">
              <Image src={settings.general.settings.hero_image_url} alt={settings.server.settings.server_name} maw={{ base: 200, md: 400 }} className="main-logo" />
            </Link>
            <Anchor td="none " href={settings.social.settings.discord_url} target="_blank">
              <Group visibleFrom="md">
                <div>
                  <Text ta="right" fz="1.4rem" fw={700} c="bright" tt="uppercase">{t("JoinDiscord")}</Text>
                  <Text ta="right" c="green.5" tt="uppercase" fw={700}>{discordCount !== null ? `${discordCount} Online` : "..."}</Text>
                </div>
                <FaDiscord color="#fff" size="3.4rem" />
              </Group>
            </Anchor>
          </Group>
        </Container>
      </Box>
      <Paper bd="none" py="0.8rem" radius={0} bg={alpha("10131A", 0.9)}>
        <Container size={1000}>
          <Group justify="space-between">
            {pagesData.filter((page) => page.enabled).map((page) => (
              <Anchor className="navbar-link" component={Link} href={page.href} key={page.label} target={page.target} >
                <Group gap="0.4rem">
                  <TbChevronRight color="var(--mantine-color-primary-5)" className="navbar-link-icon" />
                  <Text fz={{ base: "xs", xs: "lg" }} tt="uppercase" fw={500}>{page.label}</Text>
                </Group>
              </Anchor>
            ))}
          </Group>
        </Container>
      </Paper>
      <Box my="2rem">
        {children}
      </Box>
      <Footer settings={settings} />
    </FadeIn>
  );
}


