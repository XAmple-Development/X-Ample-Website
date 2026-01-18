'use client'

import { ActionIcon, Box, Button, Divider, Grid, GridCol, Group, NativeSelect, NumberInput, Select, Stack, Switch, Text, TextInput, Title, MultiSelect, CloseButton, ColorInput, Alert } from '@mantine/core';
import { useMemo, useEffect, useState } from 'react';
import { TbPlus, TbX } from 'react-icons/tb';
import { getCategories } from '../../utils/getCategories';

export default function RanksTableEditor({ form, path }) {
  const joined = useMemo(() => path.join('.'), [path]);
  const ranks = form.values?.ranks_table?.settings?.ranks || [];
  const categories = form.values?.ranks_table?.settings?.categories || [];
  const features = form.values?.ranks_table?.settings?.features || [];
  const [tebexPackages, setTebexPackages] = useState([]);
  const [tebexPackagesGrouped, setTebexPackagesGrouped] = useState([]);

  const setAt = (subKey, nextVal) => {
    const full = [...path, subKey];
    form.setFieldValue(full.join('.'), nextVal);
  };

  const rankOptions = useMemo(() => (Array.isArray(ranks) ? ranks : []).map((r) => ({ value: String(r.id || r.package_id || ''), label: String(r.label || r.id || r.package_id || '') })), [ranks]);
  const categoryOptions = useMemo(() => (Array.isArray(categories) ? categories : []).map((c) => ({ value: String(c.id || ''), label: String(c.label || c.id || '') })), [categories]);

  const PackageValue = ({ value, label, onRemove, className }) => (
    <Box className={className} px={8} py={2} bd="1px solid var(--mantine-color-background-5)" bg="background_alt">
      <Group gap={6} wrap="nowrap">
        <Text>{label || value}</Text>
        <CloseButton onMouseDown={onRemove} aria-label="Remove item" size="xs" variant="subtle" />
      </Group>
    </Box>
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cats = await getCategories();
        if (!active) return;
        const pkgMap = new Map();
        const seen = new Set();
        const grouped = [];
        (Array.isArray(cats) ? cats : []).forEach((c) => {
          const categoryName = String(c?.name ?? 'Other');
          const pkgs = Array.isArray(c?.packages) ? c.packages : [];
          const items = [];
          pkgs.forEach((p) => {
            const id = String(p?.id ?? '');
            const name = String(p?.name ?? id);
            if (!id) return;
            if (!pkgMap.has(id)) pkgMap.set(id, { value: id, label: name });
            if (!seen.has(id)) {
              seen.add(id);
              items.push({ value: id, label: name });
            }
          });
          if (items.length > 0) grouped.push({ group: categoryName, items });
        });
        setTebexPackages(Array.from(pkgMap.values()));
        setTebexPackagesGrouped(grouped);
      } catch (_) {
        setTebexPackages([]);
        setTebexPackagesGrouped([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Stack>
      <Alert color="yellow" title="Note">
        You must have purchased the Ranks Table addon in order for this to work. Purchase at https://buzz.dev/shop
      </Alert>
      <Title order={4}>Categories</Title>
      <Stack>
        {(Array.isArray(categories) ? categories : []).map((c, i) => (
          <Group key={i} p="sm" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" wrap="nowrap" align="end">
            <Grid gutter="sm" style={{ flex: 1 }}>
              <GridCol span={{ base: 12, sm: 6 }}>
                <TextInput label="Label" value={String(c.label ?? '')} onChange={(e) => {
                  const next = [...categories];
                  const label = e.currentTarget.value;
                  const id = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  next[i] = { ...next[i], label, id };
                  setAt('categories', next);
                }} />
              </GridCol>
              <GridCol span={{ base: 12, sm: 6 }}>
                <ColorInput label="Color" value={String(c.color ?? '#1A98CE')} onChange={(v) => {
                  const next = [...categories];
                  next[i] = { ...next[i], color: v || '#1A98CE' };
                  setAt('categories', next);
                }} />
              </GridCol>
            </Grid>
            <ActionIcon 
              size="lg" 
              onClick={() => {
                const next = categories.filter((_, idx) => idx !== i);
                setAt('categories', next);
              }}
            >
              <TbX />
            </ActionIcon>
          </Group>
        ))}
        <Button leftSection={<TbPlus />} onClick={() => setAt('categories', [...(Array.isArray(categories) ? categories : []), { id: String(Date.now()), label: '', color: '#1A98CE' }])}>Add category</Button>
      </Stack>

      <Divider my="md" />

      <Title order={4}>Ranks</Title>
      <Stack>
        {(Array.isArray(ranks) ? ranks : []).map((r, i) => (
          <Box key={i} p="sm" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
            <ActionIcon 
              size="lg" 
              pos="absolute" 
              top="1rem" 
              right="1rem" 
              zIndex={10}
              onClick={() => {
                const next = ranks.filter((_, idx) => idx !== i);
                setAt('ranks', next);
              }}
            >
              <TbX />
            </ActionIcon>
            <Grid gutter="sm" align="end">
              <GridCol span={{ base: 12, sm: 6 }}>
                <TextInput label="Label" value={String(r.label ?? '')} onChange={(e) => {
                  const next = [...ranks];
                  next[i] = { ...next[i], label: e.currentTarget.value };
                  setAt('ranks', next);
                }} />
              </GridCol>
              <GridCol span={{ base: 12, sm: 6 }}>
                <Select
                  label="Package (rank)"
                  data={tebexPackagesGrouped.length ? tebexPackagesGrouped : tebexPackages}
                  value={String(r.package_id ?? '')}
                  onChange={(v) => {
                    const next = [...ranks];
                    next[i] = { ...next[i], package_id: v || '' };
                    setAt('ranks', next);
                  }}
                  searchable
                  clearable
                  placeholder="Select a package"
                />
              </GridCol>
            </Grid>
          </Box>
        ))}
        <Button leftSection={<TbPlus />} onClick={() => setAt('ranks', [...(Array.isArray(ranks) ? ranks : []), { id: String(Date.now()), label: '', package_id: '' }])}>Add rank</Button>
      </Stack>

      <Divider my="md" />

      <Title order={4}>Features</Title>
      <Stack>
        {(Array.isArray(features) ? features : []).map((f, i) => (
          <Box key={i} p="sm" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
            <ActionIcon 
              size="lg" 
              pos="absolute" 
              top="1rem" 
              right="1rem" 
              zIndex={10}
              onClick={() => {
                const next = features.filter((_, idx) => idx !== i);
                setAt('features', next);
              }}
            >
              <TbX />
            </ActionIcon>
            <Grid gutter="sm">
              <GridCol span={{ base: 12, sm: 4 }}>
                <TextInput label="Label" value={String(f.label ?? '')} onChange={(e) => {
                  const next = [...features];
                  const label = e.currentTarget.value;
                  const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  next[i] = { ...next[i], label, key };
                  setAt('features', next);
                }} />
              </GridCol>
              <GridCol span={{ base: 12, sm: 2 }}>
                <Select label="Type" value={String(f.type ?? 'string')} onChange={(v) => {
                  const next = [...features];
                  next[i] = { ...next[i], type: v || 'string' };
                  setAt('features', next);
                }} data={[{ value: 'boolean', label: 'Boolean' }, { value: 'string', label: 'String' }, { value: 'image', label: 'Image' }]} allowDeselect={false} />
              </GridCol>
              <GridCol span={{ base: 12, sm: 3 }}>
                <Select label="Category" value={String(f.category ?? '')} onChange={(v) => {
                  const next = [...features];
                  next[i] = { ...next[i], category: v || '' };
                  setAt('features', next);
                }} data={[{ value: '', label: 'No category' }, ...categoryOptions]} clearable />
              </GridCol>
              <GridCol span={{ base: 12, sm: 9 }}>
                <TextInput label="Description" value={String(f.description ?? '')} onChange={(e) => {
                  const next = [...features];
                  next[i] = { ...next[i], description: e.currentTarget.value };
                  setAt('features', next);
                }} />
              </GridCol>
            </Grid>
            <Divider my="sm" />
            <Stack>
              <Title order={6}>Values by rank</Title>
              <Grid gutter="sm">
                {(Array.isArray(ranks) ? ranks : []).map((r, ri) => (
                  <GridCol key={ri} span={{ base: 12, sm: 4 }}>
                    {(() => {
                      const rankId = String(r.id || r.package_id || '');
                      const values = f.values || {};
                      const setValue = (val) => {
                        const next = [...features];
                        const nv = { ...(next[i]?.values || {}) };
                        nv[rankId] = val;
                        next[i] = { ...next[i], values: nv };
                        setAt('features', next);
                      };
                      if (String(f.type) === 'boolean') {
                        return <Switch label={r.label || rankId} checked={Boolean(values[rankId])} onChange={(e) => setValue(e.currentTarget.checked)} />;
                      }
                      const label = String(f.type) === 'image' ? `${r.label || rankId} (Image URL)` : (r.label || rankId);
                      return <TextInput label={label} value={String(values[rankId] ?? '')} onChange={(e) => setValue(e.currentTarget.value)} />;
                    })()}
                  </GridCol>
                ))}
              </Grid>
            </Stack>
          </Box>
        ))}
        <Button leftSection={<TbPlus />} onClick={() => setAt('features', [...(Array.isArray(features) ? features : []), { label: '', type: 'string', description: '', category: '', values: {} }])}>Add feature</Button>
      </Stack>
    </Stack>
  );
}


