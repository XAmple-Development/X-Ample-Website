'use client';

import { ActionIcon, Anchor, Box, CloseButton, Group, Paper, SimpleGrid, Text, Title, Transition, alpha } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useEffect, useMemo, useState } from "react";
import { TbArrowLeft, TbArrowRight, TbExternalLink, TbMenu, TbX } from "react-icons/tb";
import Link from "next/link";
import siteSettings from "../data/settings.json";

export default function BrowseButton({ categories }) {
    const [isFixed, setIsFixed] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setIsFixed(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const onClick = () => {
        modals.open({
            size: "50rem",
            children: <BrowseModal categories={categories} />,
            withCloseButton: false,
            padding: 0
        })
    }

    return (
        <Transition
            mounted={isFixed}
        >
            {(styles) => (
                <ActionIcon
                    pos="absolute"
                    right="14rem"
                    bottom={`${600 - scrollY}px`}
                    onClick={onClick}
                    style={{ zIndex: 100, border: "3px solid #fff", ...styles }}
                    radius="50%"
                    size="5rem"
                >
                    <TbMenu size="2.5rem" />
                </ActionIcon>
            )}
        </Transition>
    )
}

function BrowseModal({ categories }) {
    const [pathStack, setPathStack] = useState([]);

    const order = siteSettings.store.settings.home_page_categories.settings.category_colors_order;

    const getParentId = (cat) => (cat && cat.parent && cat.parent.id) ? cat.parent.id : null;

    const currentParent = pathStack.length > 0 ? pathStack[pathStack.length - 1] : null;

    const visibleCategories = useMemo(() => {
        return categories.filter(c => getParentId(c) === (currentParent ? currentParent.id : null));
    }, [categories, currentParent]);

    const previousCategory = pathStack.length > 1 ? pathStack[pathStack.length - 2] : null;

    const handleCategoryClick = (category, hasChildren, href) => (e) => {
        if (hasChildren) {
            e.preventDefault();
            setPathStack([...pathStack, category]);
            return;
        }
        modals.closeAll();
    };

    return (
        <Box pos="relative">
            <CloseButton icon={<TbX color="#fff" />} onClick={() => modals.closeAll()} pos="absolute" top="1rem" right="1rem" />
            <Title pt="4rem" order={2} ta="center" mb="1rem">Browse our categories</Title>
            <Box pt="2rem" p="2rem">
                {currentParent && (
                    <Group mb="1rem" gap="0.6rem">
                        <Anchor onClick={() => setPathStack(pathStack.slice(0, -1))} c="bright">
                            <Group gap="0.4rem">
                                <TbArrowLeft size="1.2rem" />
                                <Text>Back to {previousCategory ? previousCategory.name : 'categories'}</Text>
                            </Group>
                        </Anchor>
                    </Group>
                )}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 2 }} gutter="1rem" mb="2rem">
                    {visibleCategories.map((category, index) => {
                        const color = order[index % order.length];
                        const hasChildren = categories.some(c => getParentId(c) === category.id);
                        const slugs = [...pathStack.map(c => c.slug), category.slug];
                        const href = `/store/${slugs.join('/')}`;
                        return (
                            <Anchor key={category.id} component={Link} href={hasChildren ? '#' : href} onClick={handleCategoryClick(category, hasChildren, href)} td="none" id={category.id}>
                                <Paper p={{ base: "1rem", md: "2rem" }} bg={color} h="100%" bd="none" style={{ cursor: 'pointer', boxShadow: '0 6px 0 0 ' + alpha(color, 0.5), transition: 'all 0.2s ease', transform: 'translateY(0)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(3px)';
                                        e.currentTarget.style.boxShadow = '0 3px 0 0 ' + alpha(color, 0.5);
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 0 0 ' + alpha(color, 0.5);
                                    }}
                                >
                                    <Group align="start" wrap="nowrap" justify="space-between">
                                        <Title c="bright" fz="1.6rem" fw={700} tt="uppercase" mb="0.5rem">{category.name}</Title>
                                        {!hasChildren ? <TbExternalLink color="white" size="3rem" /> : <TbArrowRight color="white" size="3rem" />}
                                    </Group>
                                    <Group gap="0.4rem">
                                        <Text c="bright" opacity={0.9}>{hasChildren ? 'Click to view' : 'Open category'}</Text>
                                        {hasChildren ? <TbArrowRight color="white" size="1.2rem" /> : null}
                                    </Group>
                                </Paper>
                            </Anchor>
                        );
                    })}
                </SimpleGrid>
            </Box>
        </Box>
    )
}

