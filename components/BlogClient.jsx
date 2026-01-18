'use client';

import { Anchor, Button, Container, Group, Image, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { TbArrowLeft } from "react-icons/tb";

export default function BlogClient({ posts }) {
    const t = useTranslations("Blog");
    const orderedPosts = [...posts].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    return (
        <Container>
            <Button h="5rem" size="xl" mb="1rem" variant="primary" component={Link} href="/" leftSection={<TbArrowLeft size="1.1rem" />} fullWidth>{t("BackToHomepage")}</Button>

            <Stack>
                {orderedPosts.map(post => {
                    const displayDate = post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                    return (
                        <Paper key={post.id} p="md" withBorder>
                            <Group align="flex-start" gap="md" wrap="nowrap">
                                <Anchor td="none" component={Link} href={`/blog/${post.slug}`}>
                                    <Image src={post.feature_image || "/demo-image.png"} alt={post.title} miw={280} h={140} mih={140} fit="cover" radius={0} />
                                </Anchor>
                                <Stack gap={4} style={{ flex: 1 }}>
                                    <Title order={3} fz="1.4rem">
                                        <Anchor td="none" c="bright" component={Link} href={`/blog/${post.slug}`}>{post.title}</Anchor>
                                    </Title>
                                    <Text c="dimmed" fz="sm">{displayDate}</Text>
                                    <Text mt="1rem" c="bright">{post.excerpt}</Text>
                                </Stack>
                            </Group>
                        </Paper>
                    );
                })}
            </Stack>
        </Container>
    );
}