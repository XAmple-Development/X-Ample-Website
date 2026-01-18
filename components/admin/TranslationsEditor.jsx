'use client'

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActionIcon, Button, Card, Divider, Group, ScrollArea, Stack, Text, TextInput, Title, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { TbPlus, TbX, TbDeviceFloppy } from 'react-icons/tb';

function flatten(obj, prefix = '') {
  return Object.keys(obj || {}).reduce((acc, k) => {
    const v = obj[k];
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(acc, flatten(v, p));
    else acc[p] = v;
    return acc;
  }, {});
}

function unflatten(obj) {
  const result = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    const parts = k.split('.');
    let cur = result;
    while (parts.length > 1) {
      const part = parts.shift();
      if (!cur[part]) cur[part] = {};
      cur = cur[part];
    }
    cur[parts[0]] = v;
  });
  return result;
}

export default function TranslationsEditor() {
  const [locales, setLocales] = useState([]);
  const [locale, setLocale] = useState('en');
  const [flat, setFlat] = useState({});
  const [filter, setFilter] = useState('');
  const searchParams = useSearchParams();
  const filtered = useMemo(() => {
    const f = (filter || '').toLowerCase();
    if (!f) return flat;
    return Object.fromEntries(Object.entries(flat).filter(([k, v]) => k.toLowerCase().includes(f) || String(v || '').toLowerCase().includes(f)));
  }, [flat, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    Object.entries(filtered).forEach(([k, v]) => {
      const top = k.includes('.') ? k.split('.')[0] : 'General';
      if (!groups[top]) groups[top] = [];
      groups[top].push([k, v]);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/locales');
        const data = await res.json();
        setLocales(data.locales || []);
        const first = (data.locales || [])[0] || 'en';
        setLocale(first);
      } catch {}
    };
    run();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!locale) return;
      try {
        const [resTarget, resEn] = await Promise.all([
          fetch(`/api/admin/locales/${locale}`),
          fetch(`/api/admin/locales/en`)
        ]);
        const targetJson = await resTarget.json();
        const enJson = await resEn.json();
        const targetFlat = flatten(targetJson);
        const enFlat = flatten(enJson);
        const merged = { ...enFlat, ...targetFlat };
        setFlat(merged);
      } catch {}
    };
    load();
  }, [locale]);

  useEffect(() => {
    const f = searchParams.get('filter') || '';
    setFilter(f);
  }, [searchParams]);

  const save = async () => {
    try {
      const body = unflatten(flat);
      const res = await fetch(`/api/admin/locales/${locale}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to save');
      notifications.show({ color: 'green', title: 'Saved', message: 'Translations updated' });
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e.message || 'Failed to save' });
    }
  };

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Group align="center">
          <Select data={locales.map(l => ({ value: l, label: l }))} value={locale} onChange={setLocale} label="Locale" miw={100} searchable clearable={false} />
          <TextInput label="Filter keys or values" placeholder="Search here" value={filter} onChange={(e) => setFilter(e.currentTarget.value)} />
        </Group>
        <Button mt="1.4rem" leftSection={<TbDeviceFloppy />} onClick={save}>Save</Button>
      </Group>
      <ScrollArea h={520} offsetScrollbars>
        <Stack>
          {Object.entries(grouped).map(([section, entries]) => (
            <Stack key={section}>
              <Divider label={section} labelPosition="left" />
              {entries.map(([k, v]) => {
                const prefix = section === 'General' ? '' : section + '.';
                const labelKey = k.startsWith(prefix) ? k.slice(prefix.length) : k;
                return (
                <Group key={k} align="flex-start">
                  <Text fw={600} miw={260}>{labelKey}</Text>
                  <TextInput
                    flex={1}
                    value={String(v ?? '')}
                    onChange={(e) => {
                      const val = (e && e.currentTarget) ? e.currentTarget.value : '';
                      setFlat(prev => ({ ...prev, [k]: val }));
                    }}
                  />
                </Group>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}


