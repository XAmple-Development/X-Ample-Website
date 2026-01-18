import { Anchor, Box, Button, Card, Container, darken, Group, Image, List, ListItem, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import JoinButton from "../../components/JoinButton.jsx";
import LinkCards from "../../components/LinkCards.jsx";
import { getBlogs } from "../../utils/getBlogs";
import { getSettings } from "../../utils/settingsServer";

export const revalidate = 3600;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: `${settings.server.settings.server_name} | Minecraft Store and Community`,
        description: `Join ${settings.server.settings.server_name}, explore our blog, vote links and in‑game store.`,
        openGraph: {
            title: `${settings.server.settings.server_name} | Minecraft Store and Community`,
            description: `Join ${settings.server.settings.server_name}, explore our blog, vote links and in‑game store.`,
        }
    };
}

export default async function Page() {
    const tVote = await getTranslations('VoteHome');
    const tHome = await getTranslations('Home');
    const posts = await getBlogs(4);
    const settings = await getSettings();

    return (
        <Container>
            <LinkCards />
            <SimpleGrid mt="1rem" cols={{ base: 1, md: 2 }} spacing="lg">
                <Anchor component={Link} href={`/blog/${posts[0].slug}`}>
                    <Card className="hero-post-card" style={{ backgroundImage: `url(${posts[0].feature_image})` }}>
                        <Box p="1rem" style={{ zIndex: 2 }} pos="absolute" left="0" bottom="0">
                            <Title mb="0.6rem" order={2}>{posts[0].title}</Title>
                            <Text>{posts[0].excerpt}</Text>
                        </Box>
                    </Card></Anchor>
                {settings.general.settings.other.settings.show_how_to_play &&
                    <Card p="lg" h="100%">
                        <Stack justify="space-between" h="100%">
                            <Stack gap="md">
                                <Box ta="center">
                                    <Title order={3} fz="1.2rem" mb="xs">{tHome('HowToPlay')}</Title>
                                    <Text fz="sm">{tHome('GetStartedOnServer')}</Text>
                                </Box>

                                <List spacing="sm" size="sm">
                                    <ListItem>
                                        <Text size="lg" fw={500}>{tHome('DownloadMinecraft')}</Text>
                                        <Text c="dimmed" fz="sm">{tHome('GetLatestVersion')}</Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text size="lg" fw={500}>{tHome('JoinOurServer')}</Text>
                                        <Text c="dimmed" fz="sm">IP: {settings.server.settings.server_ip}</Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text size="lg" fw={500}>{tHome('CreateYourAccount')}</Text>
                                        <Text c="dimmed" fz="sm">{tHome('RegisterInGame')}</Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text size="lg" fw={500}>{tHome('StartPlaying')}</Text>
                                        <Text c="dimmed" fz="sm">{tHome('ExploreAndHaveFun')}</Text>
                                    </ListItem>
                                </List>
                            </Stack>
                            <JoinButton>
                                <Button size="lg" fullWidth>{tHome('JoinNow')}</Button>
                            </JoinButton>
                        </Stack>
                    </Card>
                }
            </SimpleGrid>

            <SimpleGrid mb="1rem" mt="2rem" cols={{ base: 1, lg: 2 }} spacing="lg">
                <Stack spacing="lg">
                    <Card p={{ base: "1rem", md: "2rem" }}>
                        <Stack align="center" justify="center">
                            <Title order={2} ta="center" mb="md">{tVote('VoteForServer')}</Title>
                            <Text maw="30rem" ta="center" c="dimmed">{tVote('VoteDescription')}</Text>
                        </Stack>
                    </Card>
                </Stack>

                <Stack spacing="md">
                    {settings.vote.settings.links.slice(0, 2).map((link, index) => (
                        <Card key={index} p="md">
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Title order={4} mb="0.2rem">{tVote('VoteLink')} #{index + 1}</Title>
                                    <Text size="sm" c="dimmed">{tVote('Every24Hours')}</Text>
                                </Box>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    c="#fff"
                                    color="blue"
                                    component="a"
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {tVote('View')}
                                </Button>
                            </Box>
                        </Card>
                    ))}
                </Stack>
            </SimpleGrid>
            <Button fullWidth size="xl" variant="primary" c="#fff" component={Anchor} href="/vote" color="blue">{tVote('ViewAllLinks')}</Button>

            {settings.patrons.settings.shown &&
                <Stack mt="2rem">
                    {settings.patrons.settings.patrons.length > 0 && settings.patrons.settings.patrons.map((patron, index) => (
                        <Card key={index} bg={patron.backgroundColor} p={{ base: "1rem 2rem", md: "2rem 3rem" }}>
                            <Group w="100% " justify="space-between">
                                <div>
                                    <Title fw={900} fz="2rem" order={2} c={patron.textColor}>{patron.name}</Title>
                                    <Text size="xl" fw={600} mt="0.8rem" c={patron.descriptionColor}>{patron.description}</Text>
                                </div>
                                <Text c={patron.textColor} fw={700} style={{ opacity: 0.3, textShadow: `-1px -1px 0 ${darken(patron.backgroundColor, 0.1)}, 1px -1px 0 ${darken(patron.backgroundColor, 0.1)}, -2px 2px 0 ${darken(patron.backgroundColor, 0.1)}, 1px 1px 0 ${darken(patron.backgroundColor, 0.1)}` }} fz="5rem">+${new Intl.NumberFormat('en-GB').format(patron.donation_amount)}</Text>
                            </Group>
                            <SimpleGrid mt="5rem" cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="xl">
                                {patron.users.map((user, index) => (
                                    <Card bd={"1px solid " + patron.backgroundColor} shadow={darken(patron.backgroundColor, 0.2) + " 0px 6px 0px 0px"} key={index} bg={darken(patron.backgroundColor, 0.1)} p="md">
                                        <Group gap="1.4rem">
                                            <Image src={"https://minotar.net/avatar/" + user} w={40} h={40} />
                                            <Text style={{ textShadow: `-1px -1px 0 ${patron.backgroundColor}, 1px -1px 0 ${patron.backgroundColor}, -1px 1px 0 ${patron.backgroundColor}, 1px 1px 0 ${patron.backgroundColor}` }} size="lg" fw={700} c={patron.textColor}>{user}</Text>
                                        </Group>
                                    </Card>
                                ))}

                            </SimpleGrid>
                        </Card>
                    ))}
                </Stack>}
        </Container>
    );
}


