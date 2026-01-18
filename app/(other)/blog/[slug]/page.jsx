import { Carousel, CarouselSlide } from "@mantine/carousel";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Image,
    Paper,
    rem,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import parse from "html-react-parser";
import { TbArrowLeft, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import BlogCard from "../../../../components/BlogCard";
import { getBlogBySlug } from "../../../../utils/getBlogBySlug";
import { getTimeAgo } from "../../../../utils/getTimeAgo";
import { getBlogs } from "../../../../utils/getBlogs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { getSettings } from "../../../../utils/settingsServer";

export async function generateMetadata({ params }) {
    const settings = await getSettings();
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    return {
        title: blog.title + " | " + settings.server.settings.server_name,
        description: blog.excerpt,
    };
}

export default async function Page({ params }) {
    const settings = await getSettings();
    if (!settings.blog.settings.enabled) {
        return redirect("/")
    }

    const t = await getTranslations('Blog');
    const { slug } = await params;

    const blog = await getBlogBySlug(slug);

    if (!blog) {
        return notFound();
    }

    const allPosts = await getBlogs();

    return (
        <Container>
            <Button h="5rem" size="xl" mb="1rem" variant="primary" component={Link} href="/blog" leftSection={<TbArrowLeft size="1.1rem" />} fullWidth>{t('BackToBlog')}</Button>
            <Paper pt="2rem" p={{ base: "1rem", md: "2rem", lg: "3rem" }}>
                <Title fz="1.4rem">
                    {blog.title}
                </Title>
                <Text c="dimmed" fz="sm">{t('PostedOn')} {getTimeAgo(blog.published_at)}</Text>
                <Box fz="lg">
                    {parse(blog.html)}
                </Box>
            </Paper>
            <Image mt="1rem" fit="cover" mb="1rem" radius={4} src={blog.feature_image} alt={blog.title + " cover image"}
                height={400} />
            <Stack mt="2rem" align="center">
                <Title mt="2rem" fz={{ base: "2rem", md: "3rem" }} ta="center" order={2}>
                    {t('MoreFromUs')}
                </Title>
                <Text mb="1rem" maw="40rem" size="lg" ta="center" c="dimmed">
                    {t('ExploreTopPosts')}
                </Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {allPosts.map((post) => (
                    <BlogCard post={post} />
                ))}
            </SimpleGrid>
        </Container>
    )
}