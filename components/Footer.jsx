'use client';

import { ActionIcon, Anchor, Box, Button, Container, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { FaArrowUp, FaDiscord, FaTwitter, FaYoutube, FaGithub, FaReddit, FaInstagram, FaFacebook, FaTwitch, FaGlobe } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { TbArrowRight } from "react-icons/tb";

export default function Footer({ settings }) {
    const t = useTranslations('Footer');
    const s = settings.social?.settings || {};
    const links = s.links || {};
    const iconMap = { FaDiscord, FaTwitter, FaYoutube, FaGithub, FaReddit, FaInstagram, FaFacebook, FaTwitch, FaGlobe };
    const socialLinks = Object.entries(links)
        .filter(([, v]) => Boolean(v && v.show && v.url))
        .map(([k, v]) => {
            const Icon = iconMap[v.icon] || null;
            return { url: v.url, iconName: v.icon, Icon, label: k };
        });

    return (
        <Box style={{ borderTop: "3px solid var(--mantine-color-background_alt-5)" }}>
            <Box bg="#0D121C" p="xl">
                <Container>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
                        <Stack gap="md">
                            <Text fw={700} fz="lg" c="white">
                                {t('Copyright')} © {new Date().getFullYear()} {settings.server.settings.server_name}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {t('WeAreNotAffiliatedWithMojangStudios')}
                            </Text>
                            <Group gap="xs">
                                {socialLinks.map(({ url, iconName, Icon, label }, index) => (
                                    <ActionIcon bg="#0E1118" key={`${label}-${index}`} component={Link} href={url} target="_blank" variant="filled" bd="1px solid #192030" size="sm" p="xs" miw={40} h={40}>
                                        <Icon color="#fff" size={16} />
                                    </ActionIcon>
                                ))}
                            </Group>
                        </Stack>

                        <Stack gap="md">
                            <Text fw={700} fz="lg" c="white">
                                {t('UsefulLinks')}
                            </Text>
                            <Stack gap="xs">
                                <Anchor component={Link} href="/" c="white" td="none">
                                    <Group gap="0.4rem">
                                        <Text>{t('Home')}</Text>
                                        <TbArrowRight />
                                    </Group>
                                </Anchor>
                                <Anchor component={Link} href="/rules" c="white" td="none">
                                    <Group gap="0.4rem">
                                        <Text>{t('Store')}</Text>
                                        <TbArrowRight />
                                    </Group>
                                </Anchor>
                            </Stack>
                        </Stack>

                        <Stack gap="md">
                            <Text fw={700} fz="lg" c="white">
                                {t('Support')}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {t('SupportDescription')}
                            </Text>
                            <Anchor target="_blank" component={Link} href={settings.social.settings.discord_url} c="white" td="none">
                                <Group gap="0.4rem">
                                    <FaDiscord size="1.2rem" />
                                    <Text>{t('Support')}</Text>
                                </Group>
                            </Anchor>
                        </Stack>
                    </SimpleGrid>
                    {/* WARNING: REMOVING/CHANGING THIS BRANDING BELOW WILL VOID YOUR LICENSE & SUPPORT - UNLESS YOU HAVE PURCHASED THE ADDON THAT ALLOWS YOU TO DO SO */}
                    <Text><Anchor fw={700} c="primary" target="_blank" component={Link} href="https://builtbybit.com/prism">Prism</Anchor> theme by Vosiekip x Buzz</Text>
                    {/* WARNING: REMOVING/CHANGING THIS BRANDING ABOVE WILL VOID YOUR LICENSE & SUPPORT - UNLESS YOU HAVE PURCHASED THE ADDON THAT ALLOWS YOU TO DO SO */}
                </Container>
            </Box>

            <Box bg="background_alt" p="md">
                <Container>
                    <Group>
                        <Button component={Link} href="/" variant="primary">
                            {t('Home')}
                        </Button>
                        <ActionIcon
                            onClick={() => {
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                            }}
                            variant="primary"
                            size="lg"
                            c="#fff"
                        >
                            <FaArrowUp color="#fff" />
                        </ActionIcon>
                    </Group>
                </Container>
            </Box>
        </Box>
    );
}
