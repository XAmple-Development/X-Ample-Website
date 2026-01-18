'use client'

import { ActionIcon, Box, Button, Divider, Group, NumberInput, SimpleGrid, Stack, Switch, Text, TextInput, Title, ColorInput, Select, MultiSelect, CloseButton } from '@mantine/core';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TbPlus, TbX, TbPencil } from 'react-icons/tb';
import { getCategories } from '../../utils/getCategories';

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

const formatLabel = (k) => {
  const spaced = String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  const titled = spaced.replace(/\b\w/g, (m) => m.toUpperCase());
  return titled
    .replace(/\bids\b/gi, 'IDs')
    .replace(/\burl\b/gi, 'URL')
    .replace(/\bip\b/gi, 'IP');
};

function Field({ label, value, onChange, type }) {
  if (typeof value === 'boolean') return <Switch label={label} checked={value} onChange={(e) => onChange(e.currentTarget.checked)} />;
  if (typeof value === 'number') return <NumberInput label={label} value={value} onChange={(v) => onChange(typeof v === 'number' ? v : 0)} />;
  if (typeof value === 'string') {
    const isHex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value || '');
    const lower = (label || '').toLowerCase();
    if (type === 'color' || isHex || lower.includes('color')) {
      return <ColorInput format="hex" label={label} value={value || ''} onChange={(v) => onChange(v)} />;
    }
  }
  return <TextInput label={label} value={String(value ?? '')} onChange={(e) => onChange(e.currentTarget.value)} />;
}

export default function SectionEditor({ path, form, value }) {
  const keys = useMemo(() => Object.keys(value || {}), [value]);
  const [tebexCategories, setTebexCategories] = useState([]);
  const [tebexCategoriesGrouped, setTebexCategoriesGrouped] = useState([]);
  const [tebexPackages, setTebexPackages] = useState([]);
  const [tebexPackagesGrouped, setTebexPackagesGrouped] = useState([]);
  const joinedPath = useMemo(() => path.join('.'), [path]);
  const categoryLabelMap = useMemo(() => new Map((Array.isArray(tebexCategories) ? tebexCategories : []).map((o) => [o.value, o.label])), [tebexCategories]);
  const packageLabelMap = useMemo(() => new Map((Array.isArray(tebexPackages) ? tebexPackages : []).map((o) => [o.value, o.label])), [tebexPackages]);
  const CategoryValue = ({ value, label, onRemove, className }) => (
    <Box className={className} px={8} py={2} bd="1px solid var(--mantine-color-background-5)" bg="background_alt">
      <Group gap={6} wrap="nowrap">
        <Text>{categoryLabelMap.get(String(value)) || String(label || value)}</Text>
        <CloseButton onMouseDown={onRemove} aria-label="Remove item" size="xs" variant="subtle" />
      </Group>
    </Box>
  );
  const PackageValue = ({ value, label, onRemove, className }) => (
    <Box className={className} px={8} py={2} bd="1px solid var(--mantine-color-background-5)" bg="background_alt">
      <Group gap={6} wrap="nowrap">
        <Text>{packageLabelMap.get(String(value)) || String(label || value)}</Text>
        <CloseButton onMouseDown={onRemove} aria-label="Remove item" size="xs" variant="subtle" />
      </Group>
    </Box>
  );

  useEffect(() => {
    let active = true;
    if (joinedPath === 'store.settings.home_page_categories.settings.categories') {
      (async () => {
        try {
          const data = await getCategories();
          if (!active) return;
          const cats = Array.isArray(data) ? data : [];
          const nodes = new Map();
          cats.forEach((c) => {
            const id = String(c?.id ?? '');
            const name = String(c?.name ?? id);
            if (!id) return;
            let parentId;
            const p = c?.parent;
            if (typeof p === 'string' || typeof p === 'number') parentId = String(p);
            else if (p && typeof p === 'object') parentId = String(p?.id ?? '');
            else if (typeof c?.parent_id !== 'undefined') parentId = String(c.parent_id);
            nodes.set(id, { id, name, parentId: parentId || '' });
          });
          const children = new Map();
          Array.from(nodes.values()).forEach((n) => {
            const list = children.get(n.parentId) || [];
            list.push(n.id);
            children.set(n.parentId, list);
          });
          const buildPath = (id, limit = 20) => {
            const pathNames = [];
            let current = nodes.get(id);
            let safety = 0;
            while (current && safety < limit) {
              pathNames.push(current.name);
              const pid = current.parentId;
              if (!pid) break;
              current = nodes.get(pid);
              safety += 1;
            }
            return pathNames.reverse();
          };
          const flat = Array.from(nodes.values()).map((n) => ({ value: n.id, label: n.name }));
          const grouped = [];
          Array.from(children.entries()).forEach(([pid, ids]) => {
            const items = ids.map((cid) => {
              const n = nodes.get(cid);
              return n ? { value: n.id, label: n.name } : null;
            }).filter(Boolean);
            if (items.length === 0) return;
            let groupLabel = 'Top level';
            if (pid && nodes.get(pid)) groupLabel = buildPath(pid).join(' / ');
            grouped.push({ group: groupLabel, items });
          });
          setTebexCategories(flat.filter((o) => o.value && o.label));
          setTebexCategoriesGrouped(grouped);
        } catch (_) {
          setTebexCategories([]);
          setTebexCategoriesGrouped([]);
        }
      })();
    }
    return () => {
      active = false;
    };
  }, [joinedPath]);

  useEffect(() => {
    let active = true;
    if (joinedPath === 'store.settings.featured_package_ids' || joinedPath === 'store.settings.package_variations.package_ids_with_quantity_selection') {
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
    }
    return () => {
      active = false;
    };
  }, [joinedPath]);

  const setAt = (subKey, nextVal) => {
    const full = [...path, subKey];
    form.setFieldValue(full.join('.'), nextVal);
  };

  const getFieldType = (fieldPath, fieldValue) => {
    const arr = Array.isArray(fieldPath) ? fieldPath : String(fieldPath || '').split('.');
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    let node = form?.values?.[arr[0]]?.types;
    for (let i = 1; i < arr.length && node; i += 1) {
      const key = String(arr[i]);
      if (/^\d+$/.test(key)) continue;
      if (typeof node === 'string') return node;
      node = node?.[key];
    }
    if (typeof node === 'string') return node;
    const jp = arr.join('.');
    if (
      jp === 'theme.settings.primary' ||
      jp === 'theme.settings.primary_alt' ||
      jp === 'theme.settings.secondary' ||
      jp === 'theme.settings.background' ||
      jp === 'theme.settings.background_alt' ||
      jp === 'theme.settings.text_color' ||
      jp === 'theme.settings.title_color' ||
      jp === 'store.settings.home_page_categories.settings.category_colors_order'
    ) return 'color';
    return undefined;
  };

  if (Array.isArray(value)) {
    if (joinedPath === 'store.settings.home_page_categories.settings.categories') {
      return (
        <Stack>
          <MultiSelect
            label={formatLabel(path[path.length - 1])}
            data={tebexCategoriesGrouped.length ? tebexCategoriesGrouped : tebexCategories}
            valueComponent={CategoryValue}
            value={(Array.isArray(value) ? value : []).map((v) => String(v))}
            onChange={(v) => form.setFieldValue(path.join('.'), v)}
          />
        </Stack>
      );
    }
    if (joinedPath === 'store.settings.featured_package_ids') {
      return (
        <Stack>
          <MultiSelect
            label={formatLabel(path[path.length - 1])}
            data={tebexPackagesGrouped.length ? tebexPackagesGrouped : tebexPackages}
            valueComponent={PackageValue}
            value={(Array.isArray(value) ? value : []).map((v) => String(v))}
            onChange={(v) => form.setFieldValue(path.join('.'), v)}
          />
        </Stack>
      );
    }
    if (joinedPath === 'store.settings.package_variations.package_ids_with_quantity_selection') {
      return (
        <Stack>
          <MultiSelect
            label={formatLabel(path[path.length - 1])}
            data={tebexPackagesGrouped.length ? tebexPackagesGrouped : tebexPackages}
            valueComponent={PackageValue}
            value={(Array.isArray(value) ? value : []).map((v) => String(v))}
            onChange={(v) => form.setFieldValue(path.join('.'), v)}
          />
        </Stack>
      );
    }
    if (joinedPath === 'store.settings.home_page_categories.settings.category_colors_order') {
      return (
        <Stack w="100%">
          {value.map((item, idx) => (
            <Group key={idx} p="sm" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" wrap="nowrap" align="end">
              <Field 
                label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} 
                value={item} 
                type={getFieldType(path, item)} 
                onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} 
                style={{ flex: 1 }}
              />
              <ActionIcon 
                size="lg" 
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
            </Group>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            const next = [...value, ''];
            form.setFieldValue(path.join('.'), next);
          }}>Add</Button>
        </Stack>
      );
    }
    if (joinedPath === 'patrons.settings.patrons') {
      return (
        <Stack w="100%">
          {value.map((item, idx) => (
            <Box key={idx} p="sm" pt="2rem" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
              <ActionIcon 
                size="lg" 
                pos="absolute" 
                top="1rem" 
                right="1rem" 
                zIndex={10}
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
              {isObject(item) ? (
                <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
              ) : (
                <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} />
              )}
            </Box>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            let template;
            const pathStr = path.join('.');
            if (value && value.length > 0 && isObject(value[0])) {
              const sampleObj = value[0] || {};
              const keys = Object.keys(sampleObj);
              template = keys.reduce((acc, k) => {
                const sample = sampleObj[k];
                if (Array.isArray(sample)) {
                  if (sample.length > 0) {
                    const first = sample[0];
                    if (typeof first === 'string') acc[k] = [''];
                    else if (typeof first === 'number') acc[k] = [0];
                    else if (typeof first === 'boolean') acc[k] = [false];
                    else if (isObject(first)) acc[k] = [{}];
                    else acc[k] = [];
                  } else {
                    acc[k] = [''];
                  }
                } else if (typeof sample === 'boolean') {
                  acc[k] = false;
                } else if (typeof sample === 'number') {
                  acc[k] = 0;
                } else if (isObject(sample)) {
                  acc[k] = {};
                } else {
                  acc[k] = '';
                }
                return acc;
              }, {});
            } else if (isObject(value[0])) {
              template = {};
            } else {
              template = '';
            }
            const next = [...value, template];
            form.setFieldValue(path.join('.'), next);
          }}>Add</Button>
        </Stack>
      );
    }
    if (joinedPath === 'rules.settings.rules' || joinedPath === 'rules.settings.discord_rules') {
      return (
        <Stack w="100%">
          {value.map((item, idx) => (
            <Box key={idx} p="sm" pt="2rem" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
              <ActionIcon 
                size="lg" 
                pos="absolute" 
                top="1rem" 
                right="1rem" 
                zIndex={10}
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
              {isObject(item) ? (
                <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
              ) : (
                <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} />
              )}
            </Box>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            let template;
            const pathStr = path.join('.');
            if (value && value.length > 0 && isObject(value[0])) {
              const sampleObj = value[0] || {};
              const keys = Object.keys(sampleObj);
              template = keys.reduce((acc, k) => {
                const sample = sampleObj[k];
                if (Array.isArray(sample)) {
                  if (sample.length > 0) {
                    const first = sample[0];
                    if (typeof first === 'string') acc[k] = [''];
                    else if (typeof first === 'number') acc[k] = [0];
                    else if (typeof first === 'boolean') acc[k] = [false];
                    else if (isObject(first)) acc[k] = [{}];
                    else acc[k] = [];
                  } else {
                    acc[k] = [''];
                  }
                } else if (typeof sample === 'boolean') {
                  acc[k] = false;
                } else if (typeof sample === 'number') {
                  acc[k] = 0;
                } else if (isObject(sample)) {
                  acc[k] = {};
                } else {
                  acc[k] = '';
                }
                return acc;
              }, {});
            } else if (isObject(value[0])) {
              template = {};
            } else {
              template = '';
            }
            const next = [...value, template];
            form.setFieldValue(path.join('.'), next);
          }}>Add</Button>
        </Stack>
      );
    }
    if (joinedPath === 'vote.settings.links' || joinedPath === 'general.settings.vanity_links.settings.links') {
      return (
        <Stack w="100%">
          {value.map((item, idx) => (
            <Box key={idx} p="sm" pt="2rem" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
              <ActionIcon 
                size="lg" 
                pos="absolute" 
                top="1rem" 
                right="1rem" 
                zIndex={10}
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
              {isObject(item) ? (
                <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
              ) : (
                <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} />
              )}
            </Box>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            let template;
            const pathStr = path.join('.');
            if (value && value.length > 0 && isObject(value[0])) {
              const sampleObj = value[0] || {};
              const keys = Object.keys(sampleObj);
              template = keys.reduce((acc, k) => {
                const sample = sampleObj[k];
                if (Array.isArray(sample)) {
                  if (sample.length > 0) {
                    const first = sample[0];
                    if (typeof first === 'string') acc[k] = [''];
                    else if (typeof first === 'number') acc[k] = [0];
                    else if (typeof first === 'boolean') acc[k] = [false];
                    else if (isObject(first)) acc[k] = [{}];
                    else acc[k] = [];
                  } else {
                    acc[k] = [''];
                  }
                } else if (typeof sample === 'boolean') {
                  acc[k] = false;
                } else if (typeof sample === 'number') {
                  acc[k] = 0;
                } else if (isObject(sample)) {
                  acc[k] = {};
                } else {
                  acc[k] = '';
                }
                return acc;
              }, {});
            } else if (isObject(value[0])) {
              template = {};
            } else {
              template = '';
            }
            const next = [...value, template];
            form.setFieldValue(path.join('.'), next);
          }}>Add</Button>
        </Stack>
      );
    }
    if (joinedPath === 'translation.settings.languages') {
      return (
        <Stack w="100%">
          {value.map((item, idx) => (
            <Box key={idx} p="sm" pt="2rem" bg="background_alt" bd="1px solid var(--mantine-color-background-5)" pos="relative">
              <ActionIcon 
                size="lg" 
                pos="absolute" 
                top="1rem" 
                right="1rem" 
                zIndex={10}
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  form.setFieldValue(path.join('.'), next);
                }}
              >
                <TbX />
              </ActionIcon>
              {isObject(item) ? (
                <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
              ) : (
                <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                  const next = [...value];
                  next[idx] = v;
                  form.setFieldValue(path.join('.'), next);
                }} />
              )}
            </Box>
          ))}
          <Button leftSection={<TbPlus />} onClick={() => {
            let template;
            const pathStr = path.join('.');
            if (value && value.length > 0 && isObject(value[0])) {
              const sampleObj = value[0] || {};
              const keys = Object.keys(sampleObj);
              template = keys.reduce((acc, k) => {
                const sample = sampleObj[k];
                if (Array.isArray(sample)) {
                  if (sample.length > 0) {
                    const first = sample[0];
                    if (typeof first === 'string') acc[k] = [''];
                    else if (typeof first === 'number') acc[k] = [0];
                    else if (typeof first === 'boolean') acc[k] = [false];
                    else if (isObject(first)) acc[k] = [{}];
                    else acc[k] = [];
                  } else {
                    acc[k] = [''];
                  }
                } else if (typeof sample === 'boolean') {
                  acc[k] = false;
                } else if (typeof sample === 'number') {
                  acc[k] = 0;
                } else if (isObject(sample)) {
                  acc[k] = {};
                } else {
                  acc[k] = '';
                }
                return acc;
              }, {});
            } else if (isObject(value[0])) {
              template = {};
            } else {
              template = '';
            }
            const next = [...value, template];
            form.setFieldValue(path.join('.'), next);
          }}>Add</Button>
        </Stack>
      );
    }
    return (
      <Stack w="100%">
        {value.map((item, idx) => (
          <Box w="100%" pos="relative" bg="background_alt" key={idx} p="sm" bd="1px solid var(--mantine-color-background-5)">
            <ActionIcon 
              size="lg" 
              pos="absolute" 
              top="1rem" 
              right="1rem" 
              zIndex={10}
              onClick={() => {
                const next = value.filter((_, i) => i !== idx);
                form.setFieldValue(path.join('.'), next);
              }}
            >
              <TbX />
            </ActionIcon>
            {isObject(item) ? (
              <SectionEditor path={[...path, String(idx)]} form={form} value={item} />
            ) : (
              <Field label={`${formatLabel(path[path.length - 1])} (${idx + 1})`} value={item} type={getFieldType(path, item)} onChange={(v) => {
                const next = [...value];
                next[idx] = v;
                form.setFieldValue(path.join('.'), next);
              }} />
            )}
          </Box>
        ))}
        <Button leftSection={<TbPlus />} onClick={() => {
          let template;
          const pathStr = path.join('.');
          if (value && value.length > 0 && isObject(value[0])) {
            const sampleObj = value[0] || {};
            const keys = Object.keys(sampleObj);
            template = keys.reduce((acc, k) => {
              const sample = sampleObj[k];
              if (Array.isArray(sample)) {
                if (sample.length > 0) {
                  const first = sample[0];
                  if (typeof first === 'string') acc[k] = [''];
                  else if (typeof first === 'number') acc[k] = [0];
                  else if (typeof first === 'boolean') acc[k] = [false];
                  else if (isObject(first)) acc[k] = [{}];
                  else acc[k] = [];
                } else {
                  acc[k] = [''];
                }
              } else if (typeof sample === 'boolean') {
                acc[k] = false;
              } else if (typeof sample === 'number') {
                acc[k] = 0;
              } else if (isObject(sample)) {
                acc[k] = {};
              } else {
                acc[k] = '';
              }
              return acc;
            }, {});
          } else if (/translation\.settings\.languages$/.test(pathStr)) {
            template = { flag: '', value: '', key: '' };
          } else if (/vote\.settings\.links$/.test(pathStr)) {
            template = { name: '', url: '', every: '' };
          } else if (/general\.settings\.vanity_links\.settings\.links$/.test(pathStr)) {
            template = { path: '', url: '' };
          } else if (isObject(value[0])) {
            template = {};
          } else {
            template = '';
          }
          const next = [...value, template];
          form.setFieldValue(path.join('.'), next);
        }}>Add</Button>
      </Stack>
    );
  }

  if (isObject(value)) {
    const joined = path.join('.');
    if (joined === 'social.settings.links') {
      return (
        <Stack>
          {keys.map((platform) => (
            <Box bg="background_alt" key={platform} p="sm" bd="1px solid var(--mantine-color-background-5)">
              <Title order={5} mb="xs">{formatLabel(platform)}</Title>
              <SectionEditor path={[...path, platform]} form={form} value={value[platform]} />
            </Box>
          ))}
        </Stack>
      );
    }
    return (
      <Stack>
        {(() => {
          const isTopLevelRoot = /^[^.]+\.settings$/.test(joined);
          return keys.map((k, idx) => (
            <React.Fragment key={k}>
              <Box>
            {k === 'description' ? (
              <Text c="dimmed">{String(value[k] ?? '')}</Text>
            ) : isObject(value[k]) || Array.isArray(value[k]) ? (
              <>
                <Title order={5} mb="xs">{formatLabel(k)}</Title>
                <SectionEditor path={[...path, k]} form={form} value={value[k]} />
              </>
            ) : (
              <>
                {(/^social\.settings\.links\.[^.]+$/.test(joined) && k === 'icon') ? (
                  <Select
                    label={formatLabel(k)}
                    data={[
                      'FaDiscord',
                      'FaTwitter',
                      'FaYoutube',
                      'FaGithub',
                      'FaReddit',
                      'FaInstagram',
                      'FaFacebook',
                      'FaTwitch',
                      'FaGlobe',
                      'FaBook'
                    ].map((v) => ({ value: v, label: v }))}
                    allowDeselect={false}
                    value={String(value[k] ?? '')}
                    onChange={(v) => setAt(k, v || '')}
                  />
                ) : (
                  <Field label={formatLabel(k)} value={value[k]} type={getFieldType([...path, k], value[k])} onChange={(v) => setAt(k, v)} />
                )}
                {(() => {
                  const isRule = /^(rules\.settings\.(rules|discord_rules)\.[0-9]+)$/.test(joined);
                  const isTranslatable = isRule && (k === 'label' || k === 'description');
                  if (!isTranslatable) return null;
                  const base = String(value[k] ?? '');
                  const target = base ? `Rules.${base}` : '';
                  const href = target ? `/admin?tab=translations&transTab=translations&filter=${encodeURIComponent(target)}` : '/admin?tab=translations&transTab=translations';
                  return (
                    <Group mt={6}>
                      <ActionIcon component={Link} href={href} variant="light" size="sm" aria-label="Edit in translations">
                        <TbPencil />
                      </ActionIcon>
                      <Text c="dimmed" fz="sm">Add the actual text in Translations: {target || 'Rules.*'}</Text>
                    </Group>
                  );
                })()}
                {k === 'override' && path.join('.') === 'store.settings.home_page_categories.settings' && (
                  <Text c="dimmed" fz="sm" mt={6}>When enabled, Home page categories will use the list below instead of auto-detecting top-level categories.</Text>
                )}
              </>
            )}
              </Box>
              {isTopLevelRoot && idx < keys.length - 1 && <Divider my="md" />}
            </React.Fragment>
          ));
        })()}
      </Stack>
    );
  }

  return <TextInput label={formatLabel(path[path.length - 1])} value={String(value ?? '')} onChange={(e) => form.setFieldValue(path.join('.'), e.currentTarget.value)} />;
}


