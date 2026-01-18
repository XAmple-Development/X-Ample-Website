'use client';

import { Anchor, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import Link from "next/link";
import { alpha } from "@mantine/core";
import { TbArrowRight } from "react-icons/tb";
import { useTranslations } from "next-intl";

const largeCardLinks = [
    {
        id: 1,
        href: "/store",
        name: "Store",
        text: "ViewAllItems",
        color: "#1A98CE"
    },
    {
        id: 2,
        href: "/vote",
        name: "Vote",
        text: "VoteForUs",
        color: "#FF5B32"
    },
    {
        id: 3,
        href: "/blog",
        name: "Blog",
        text: "ViewAllPosts",
        color: "#8A2BE2"
    }
]

export default function LinkCards() {
    const t = useTranslations('Store');
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {largeCardLinks.map((link, index) => (
                <Anchor id={link.id} key={index} component={Link} href={link.href} td="none">
                    <Paper
                        p="1rem"
                        bg={link.color}
                        bd="none"
                        style={{
                            cursor: 'pointer',
                            boxShadow: '0 6px 0 0 ' + alpha(link.color, 0.5),
                            transition: 'all 0.1s ease',
                            transform: 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(3px)';
                            e.currentTarget.style.boxShadow = '0 3px 0 0 ' + alpha(link.color, 0.5);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 6px 0 0 ' + alpha(link.color, 0.5);
                        }}
                    >
                        <Title
                            c="white"
                            fz="2.5rem"
                            fw={700}
                            tt="uppercase"
                            mb="0.5rem"
                        >
                            {link.name}
                        </Title>
                        <Group gap="0.4rem">
                            <Text c="white" opacity={0.9}>
                                {t(link.text)}
                            </Text>
                            <TbArrowRight color="white" size="1.2rem" />
                        </Group>
                    </Paper>
                </Anchor>
            ))}
        </SimpleGrid>
    )
}