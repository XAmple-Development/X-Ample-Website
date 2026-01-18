import { Badge, Card, CardSection, Container, Grid, GridCol, Group, Image, Text, Title } from '@mantine/core';
import { getTimeAgo } from '../utils/getTimeAgo';
import Link from 'next/link';

export function BlogLayout({ blog, otherBlogs, children }) {
  return (
    <Container my="calc(3% + 2rem)">
      <Grid gutter="2rem">
        <GridCol span={{ base: 12, md: 8 }}>
          <Title order={1} mb="md">{blog.title}</Title>
          <Text size="lg" c="dimmed" mb="0.4rem">{blog.description}</Text>
          <Group mb="md">
            {blog.tags.map((tag) => (
              <Badge size="md" key={tag.id} color="primary" variant="light">
                {tag.name}
              </Badge>
            ))}
          </Group>
          <Group mb="sm">
            <Text size="sm" c="dimmed">Published on: {getTimeAgo(blog.published_at)}</Text>
            <Text size="sm" c="dimmed">Read time: {blog.reading_time}</Text>
          </Group>
          <Image
            mb="1rem"
            src={blog.feature_image}
            alt={blog.title}
            radius={4}
            w="100%"
            h={400}
          />
          {children}
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <Title fz="1.6rem" order={2} mb="md">Recommended Blogs</Title>
          {otherBlogs.filter(recBlog => recBlog.id !== blog.id).slice(0, 4).map((recBlog) => (
            <Link key={recBlog.id} td="none" href={`/blog/article/${recBlog.slug}`}>
              <div>
                <Card key={recBlog.id} shadow="sm" mb="md">
                  <CardSection>
                    <Image radius={0} src={recBlog.feature_image} alt={recBlog.title} height={160} />
                  </CardSection>
                  <Group position="apart" mt="md" mb="xs">
                    <Text weight={500}>{recBlog.title}</Text>
                  </Group>
                  <Text lineClamp={3} mih="4rem" size="sm" c="dimmed">{recBlog.excerpt}</Text>
                </Card>
              </div>
            </Link>
          ))}
        </GridCol>
      </Grid>
    </Container>
  );
}