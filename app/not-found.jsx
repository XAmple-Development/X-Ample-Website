import { Box, Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { getTranslations } from 'next-intl/server';
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <Stack h="100vh" justify="center" align="center" gap="xs">
      <Title order={1} >
        {t('404')}
      </Title>
      <Text size="lg" >
        {t('pageNotFound')}
      </Text>
      <Text c="dimmed" size="md">
        {t('sorry')}
      </Text>
      <Group justify="center">
        <Button component={Link} href="/" size="md" variant="filled">
          {t('goHome')}
        </Button>
      </Group>
    </Stack>
  );
} 