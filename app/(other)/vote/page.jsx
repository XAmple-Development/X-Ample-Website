import { Button, Card, Container, Group, SimpleGrid, Text, Title } from "@mantine/core";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";
import { getSettings } from "../../../utils/settingsServer";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: "Vote | " + settings.server.settings.server_name,
        description: "Support " + settings.server.settings.server_name + " by voting on popular server lists.",
    };
};

export default async function Vote() {
    const t = await getTranslations('Vote');
    const settings = await getSettings();

    return (
        <Container>
            <Button h="5rem" size="xl" mb="1rem" variant="primary" component={Link} href="/" leftSection={<TbArrowLeft size="1.1rem" />} fullWidth>{t('BackToHomepage')}</Button>
            <Card mt="1rem">
                <Title ta="center" mt="1rem" mb="2rem" order={3} fz={{ base: "1.2rem", md: "1.4rem" }}>{t('VoteForServer')}</Title>
                <Text ta="center" c="dimmed">{t('VoteDescription')}</Text>
            </Card>
            <SimpleGrid mt="1rem" cols={{ base: 1, md: 2 }} spacing="lg">
                {settings.vote.settings.links.map((link, index) => (
                    <Card key={index} p="md">
                       <Group justify="space-between">
                    <div>
                                <Title order={4} mb="0.2rem">{link.name}</Title>
                                <Text size="sm" c="dimmed">{t('Every') + ' ' + link.every}</Text>
                        </div>
                        <Button size="sm" variant="primary" c="#fff" component="a" href={link.url} target="_blank" rel="noopener noreferrer">{t('View')}</Button>
                       </Group>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    )
}
