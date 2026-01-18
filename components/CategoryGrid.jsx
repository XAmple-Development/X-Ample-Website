'use client';

import { alpha, Anchor, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

export default function CategoryGrid({ categories, basePath = '/store', disableLimit = false, limit, colorsOrder, shorterCards, settings }) {
    const t = useTranslations('Store');
    const order = colorsOrder || settings.store.settings.home_page_categories.settings.category_colors_order;
    const useShorter = typeof shorterCards === 'boolean' ? shorterCards : settings.store.settings.home_page_categories.settings.shorter_cards;
    const base = (basePath || '').replace(/\/+$/, '');
    const rawLimit = typeof limit === 'number' ? limit : settings.store.settings.home_page_categories.settings.category_widget_limit;
    const effectiveLimit = disableLimit ? null : (rawLimit === 0 ? 4 : rawLimit);
    const list = Array.isArray(categories) ? categories : [];
    const items = typeof effectiveLimit === 'number' && effectiveLimit > 0 ? list.slice(0, effectiveLimit) : list;
    const isTopLevelList = items.every(c => !c.parent);
    return (
        <SimpleGrid cols={isTopLevelList ? { base: 1, sm: 2, md: settings.store.settings.home_page_categories.settings.category_widgets_per_row } : { base: 1, sm: 2, md: settings.store.settings.home_page_categories.settings.category_widgets_per_row }} gutter="1rem" mb="2rem">
            {items.map((category, index) => {
                const color = order[index % order.length];
                const isMainCategory = !category.parent;
                return (
                    <Anchor
                        mih={useShorter ? "auto" : "16rem"} h="100%" id={category.id} key={category.id} component={Link} href={`${base}/${category.slug}`} style={{ textDecoration: 'none' }}>
                        <Paper
                            p={isMainCategory ? { base: "1rem", md: "2rem" } : "1rem"}
                            bg={color}
                            h="100%"
                            bd="none"
                            style={{
                                cursor: 'pointer',
                                boxShadow: '0 6px 0 0 ' + alpha(color, 0.5),
                                transition: 'all 0.2s ease',
                                transform: 'translateY(0)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(3px)';
                                e.currentTarget.style.boxShadow = '0 3px 0 0 ' + alpha(color, 0.5);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 6px 0 0 ' + alpha(color, 0.5);
                            }}
                        >
                            <Title
                                c="bright"
                                fz="2.2rem"
                                fw={700}
                                tt="uppercase"
                                mb="0.5rem"
                            >
                                {category.name}
                            </Title>
                            <Group gap="0.4rem">
                                <Text c="bright" opacity={0.9}>
                                    {t('ClickToView')}
                                </Text>
                                <TbArrowRight color="white" size="1.2rem" />
                            </Group>
                        </Paper>
                    </Anchor>
                );
            })}
        </SimpleGrid >
    );
}
