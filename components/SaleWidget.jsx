'use client'

import { alpha, darken, Flex, Group, Image, lighten, Paper, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SaleWidget({ sale, settings }) {
    if (!sale || settings.sales.settings.show_sale_banner === false) return null;

    const t = useTranslations('SaleWidget');

    const initial = () => {
        const diff = sale.expire - Math.floor(Date.now() / 1000);
        const d = Math.max(0, Math.floor(diff / (3600 * 24)));
        const h = Math.max(0, Math.floor((diff % (3600 * 24)) / 3600));
        const m = Math.max(0, Math.floor((diff % 3600) / 60));
        const s = Math.max(0, diff % 60);
        return { d, h, m, s };
    };

    const [timeLeft, setTimeLeft] = useState(initial);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const diff = Math.max(0, sale.expire - now);
            const d = Math.floor(diff / (3600 * 24));
            const h = Math.floor((diff % (3600 * 24)) / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            setTimeLeft({ d, h, m, s });
        }, 1000);
        return () => clearInterval(interval);
    }, [sale]);

    const pad2 = (n) => String(n).padStart(2, '0');

    const DigitBox = ({ char }) => (
        <Flex w={46} h={64} bg={darken("var(--mantine-color-primary-5)", 0.2)} style={{borderRadius: 4}} align="center" justify="center">
            <Text fz="2rem" fw={700} c="bright">{char}</Text>
        </Flex>
    );

    const TimeUnit = ({ value, label }) => {
        const str = pad2(value);
        return (
            <Stack gap={6} align="center">
                <Group gap={8}>
                    <DigitBox char={str[0]} />
                    <DigitBox char={str[1]} />
                </Group>
                <Text tt="uppercase" fw={900} c={darken("var(--mantine-color-primary-5)", 0.4)} fz="0.8rem">{label}</Text>
            </Stack>
        );
    };

	const units = [
		{ key: 'd', value: timeLeft.d, label: t('Days') },
		{ key: 'h', value: timeLeft.h, label: t('Hours') },
		{ key: 'm', value: timeLeft.m, label: t('Min') },
		{ key: 's', value: timeLeft.s, label: t('Sec')   },
	];

	const firstNonZeroIndex = units.findIndex((u) => u.value > 0);
	const startIndex = firstNonZeroIndex === -1 ? units.length - 1 : firstNonZeroIndex;
	const visibleUnits = units.slice(startIndex);

    return (
        <Paper className="sale-widget" pos="relative" style={{overflow: "hidden"}} bg="primary" bd={`2px solid ${lighten("var(--mantine-color-primary-5)", 0.2)}`} p={{base: "1rem", md: "1rem 3rem"}} mb="1rem">
            {settings.sales.settings.show_sale_banner_illustration && <Image visibleFrom="md" pos="absolute" style={{transform: "translateX(-50%)"}} left="40%" top="30%" src="/sale_illustration.png" alt="Sale Illustration" w="20rem" h="auto" fit="cover" />}
            <Group pos="relative" style={{zIndex: 2}} justify="space-between" align="center">
                <Stack gap={4}>
                    <Title fz="2.2rem" c="bright" order={2}>{sale.name}</Title>
                    <Text tt="uppercase" fw={800} c={darken("var(--mantine-color-primary-5)", 0.4)} fz="1.1rem">{t('ForLimitedTimeOnly')}</Text>
                </Stack>
                <Stack gap={10} align="flex-end">
                    <Text visibleFrom="sm" tt="uppercase" fw={800} c={darken("var(--mantine-color-primary-5)", 0.4)} fz="0.9rem">{t('ThisSaleWillEndIn')}</Text>
					<Group gap={18}>
						{visibleUnits.map((u) => (
							<TimeUnit key={u.key} value={u.value} label={u.label} />
						))}
					</Group>
                </Stack>
            </Group>
        </Paper>
    );
};