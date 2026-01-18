'use client'

import { ActionIcon, Box, Button, Card, Divider, Grid, GridCol, Group, Loader, NavLink, ScrollArea, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import BlogCard from '../BlogCard';
import SectionEditor from './SectionEditor';
import RanksTableEditor from './RanksTableEditor';
import TranslationsEditor from './TranslationsEditor';
import { TbArrowRight, TbBasket, TbBrandX, TbHeart, TbLanguage, TbNews, TbNote, TbPalette, TbPencil, TbPlus, TbServer, TbSettings, TbTag, TbTrash, TbStar } from 'react-icons/tb';
import { FaDiscord } from 'react-icons/fa';

export default function AdminPanel() {
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [transTab, setTransTab] = useState('translations');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        setInitial(data);
        const firstKey = Object.keys(data || {})[0] || null;
        const tabParam = searchParams.get('tab');
        setActive(tabParam || firstKey);
      } catch (e) {
        notifications.show({ color: 'red', title: 'Error', message: e.message || 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const form = useForm({ initialValues: initial || {}, validateInputOnBlur: true });

  useEffect(() => {
    if (initial) {
      form.setValues(initial);
      if (!active) {
        const tabParam = searchParams.get('tab');
        setActive(tabParam || (Object.keys(initial || {})[0] || null));
      }
    }
  }, [initial]);

  useEffect(() => {
    if (!active) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get('tab') === active) return;
    current.set('tab', active);
    router.replace(`${pathname}?${current.toString()}`);
  }, [active]);


  const iconMap = {
    general: <TbSettings />,
    server: <TbServer />,
    blog: <TbNews />,
    sales: <TbTag />,
    store: <TbBasket />,
    ranks_table: <TbStar />,
    social: <TbBrandX />,
    other: <TbSettings />,
    theme: <TbPalette />,
    patrons: <TbHeart />,
    rules: <TbNote />,
    vote: <TbPencil />,
    translations: <TbLanguage />,
  };

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlTransTab = searchParams.get('transTab');
    if (urlTab && urlTab !== active) setActive(urlTab);
    if (urlTransTab && urlTransTab !== transTab) setTransTab(urlTransTab);
  }, [searchParams]);

  useEffect(() => {
    if (active !== 'translations') return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get('transTab') === transTab) return;
    current.set('transTab', transTab);
    router.replace(`${pathname}?${current.toString()}`);
  }, [transTab, active]);

  const sections = useMemo(() => {
    const base = [...Object.keys(form.values || {}).filter((k) => k !== 'translation'), 'translations'];
    if (!base.includes('ranks_table')) base.splice(base.indexOf('store') + 1, 0, 'ranks_table');
    return base;
  }, [form.values]);

  const labelFor = (k) => {
    if (!k) return '';
    const spaced = String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const save = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save');
      }
      notifications.show({
        title: 'Saved',
        message: 'Settings updated',
        styles: {
          root: {
            backgroundColor: 'var(--mantine-color-green-5)',
          },
        }
      },
      );
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.message || 'Failed to save',
        styles: {
          root: {
            backgroundColor: 'var(--mantine-color-red-5)',
          },
        }
      },
      );
    }
  };

  const handleDeletePost = (slug) => {
    modals.openConfirmModal({
      title: 'Delete blog',
      styles: {
        header: {
          display: 'none'
        }
      },
      children: <Text py="1rem">Are you sure you want to delete this blog post?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      groupProps: {
        justify: "space-between"
      },
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/blogs/${slug}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          const posts = Array.isArray(form.values?.blog?.settings?.posts) ? form.values.blog.settings.posts : [];
          const nextPosts = posts.filter(p => p.slug !== slug);
          form.setFieldValue('blog.settings.posts', nextPosts);
          notifications.show({ color: 'green', title: 'Deleted', message: 'Blog removed' });
        } catch (e) {
          notifications.show({ color: 'red', title: 'Error', message: e.message || 'Failed to delete' });
        }
      }
    });
  };

  const description = active && active !== 'translations' ? (form.values?.[active]?.description || '') : '';
  const activeSettings = active && active !== 'translations' ? (form.values?.[active]?.settings || {}) : {};

  if (loading) return <Group align="center" justify="center"><Loader /></Group>;
  if (!initial) return <Text>No settings. Check the file exists in data/settings.json</Text>;

  return (
    <Grid gutter="lg">
      <GridCol span={{ base: 12, md: 3 }}>
        <Box pos="sticky" top={16}>
          <Card mb="1rem" className="admin-sidebar" withBorder p="sm" radius={10} >
            <Stack gap={6}>
              <Stack gap={6}>
                {sections.map((key) => (
                  <NavLink
                    rightSection={<TbArrowRight />}
                    leftSection={iconMap[key]}
                    key={key}
                    label={labelFor(key)}
                    active={key === active}
                    onClick={() => setActive(key)}
                    fz="1.2rem"
                    className="admin-sidebar-item"
                  />
                ))}
              </Stack>
              <Divider my="sm" />
              <Button onClick={save} size="md">Save changes</Button>
            </Stack>
          </Card>
          <Card withBorder p="sm" radius={10}>
            <Title mb="0.4rem" order={3}>Need help?</Title>
            <Text mb="1rem" size="sm">Join our Discord Server and make a ticket for a  guaranteed <b>less than 24h</b> response!</Text>
            <Button variant="outline" leftSection={<FaDiscord />} component={Link} href="https://discord.gg/buzz" target="_blank" size="sm">Join Discord</Button>
          </Card>
        </Box>
      </GridCol>
      <GridCol span={{ base: 12, md: 9 }}>
        <Card withBorder p={{ base: '1rem', md: '1.25rem' }} radius={10} className="admin-content-card">
          <Group justify="space-between" align="center" mb="sm">
            <Title order={3}>{labelFor(active)}</Title>
            {active === 'translations' ? (
              <SegmentedControl w="100%" value={transTab} onChange={setTransTab} data={[{ label: 'Settings', value: 'settings' }, { label: 'Translations', value: 'translations' }]} />
            ) : null}
          </Group>
          {active === 'translations' ? (
            transTab === 'settings' ? (
              <>
                {form.values?.translation?.description && <Text c="dimmed" mb="md">{form.values.translation.description}</Text>}
                <SectionEditor path={['translation', 'settings']} form={form} value={form.values?.translation?.settings || {}} />
              </>
            ) : (
              <TranslationsEditor />
            )
          ) : active === 'blog' ? (
            <>
              <Group justify="space-between" mb="md">
                <Title order={4}>Posts</Title>
                <Button component={Link} href="/admin/blog/create" variant="filled" leftSection={<TbPlus />}>Create Blog</Button>
              </Group>
              <Grid>
                {(Array.isArray(form.values?.blog?.settings?.posts) ? form.values.blog.settings.posts : []).map((post) => (
                  <GridCol key={post.slug} span={{ base: 12, sm: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <BlogCard post={post} />
                      <Group gap="xs" pos="absolute" top={8} right={8}>
                        <ActionIcon component={Link} href={`/admin/blog/edit/${post.slug}`} size="md" variant="filled"><TbPencil /></ActionIcon>
                        <ActionIcon onClick={() => handleDeletePost(post.slug)} size="md" variant="filled" color="red"><TbTrash /></ActionIcon>
                      </Group>
                    </div>
                  </GridCol>
                ))}
              </Grid>
            </>
          ) : (
            <>
              {description && <Text c="dimmed" mb="md">{description}</Text>}
              {active === 'rules' ? (
                <Text c="dimmed" mb="md">Enter keys for each rule label and description, then add the actual text in the Translations tab under Rules. For example, a label of noCheating will map to Rules.noCheating and a description of noCheatingDesc will map to Rules.noCheatingDesc.</Text>
              ) : null}
              {active === 'ranks_table' ? (
                <RanksTableEditor form={form} path={[active, 'settings']} />
              ) : (
                <SectionEditor path={[active, 'settings']} form={form} value={activeSettings} />
              )}
            </>
          )}
        </Card>
      </GridCol>
    </Grid>
  );
}


