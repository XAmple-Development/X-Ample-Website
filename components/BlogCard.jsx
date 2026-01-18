import { Badge, Box, Button, Card, CardSection, Group, Image, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function BlogCard({ post }) {
    const t = useTranslations("Blog");

    return (
        <Card className="blog-card" key={post.id} mih="30rem" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Stack style={{ flex: 1 }}>
                {post.feature_image && (
                    <CardSection className="blog-card-image" h={260}>
                        <Link href={`/blog/${post.slug}`}>
                            <Image src={post.feature_image} alt={post.title} h="100%" w="100%" fit="cover" />
                        </Link>
                    </CardSection>
                )}
                <Box style={{ flex: 1 }}>
                    <Title order={3} fz="1.3rem" mb="xs" style={{ lineHeight: 1.2 }}>{post.title}</Title>
                    <Text c="dimmed" fz="sm" mb="md" lineClamp={3} style={{ lineHeight: 1.5 }}>{post.excerpt}</Text>
                </Box>
                <Group gap="xs" >
                    <Text c="dimmed" fz="sm">{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Text>
                </Group>
                <Box mt="auto">
                    <Button component="a" href={`/blog/${post.slug}`} size="md" fullWidth variant="filled" colour="primary">{t("ReadMore")}</Button>
                </Box>
            </Stack>
        </Card>
    )
}