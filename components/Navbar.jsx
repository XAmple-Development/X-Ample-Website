"use client";

import {
    Box,
    Container,
    Group,
    Text,
    ActionIcon,
    Anchor,
    Button,
    Image,
    Indicator
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { TbBasket } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { modals } from '@mantine/modals';
import LoginForm from './LoginForm';
import { useUser } from '../contexts/UserContext';
import { useBasket } from '../contexts/BasketContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ settings }) {
    const { user } = useUser();
    const [showBasket, setShowBasket] = useState(false);
    const t = useTranslations('Navbar');
    const { basket } = useBasket();
    const itemCount = useMemo(() => {
        const pkgs = Array.isArray(basket?.data?.packages) ? basket.data.packages : [];
        return pkgs.reduce((acc, p) => acc + (p?.in_basket?.quantity || 0), 0);
    }, [basket]);

    useEffect(() => {
        const hasBasket = Cookies.get('basket') && Cookies.get('basket') !== 'undefined';
        const hasUser = Cookies.get('user') && Cookies.get('user') !== 'undefined';
        setShowBasket(Boolean(hasBasket && hasUser));
    }, []);

    const openLoginModal = () => {
        modals.open({
            children: <LoginForm onLogin={() => window.location.reload()} />,
            withCloseButton: false,
            size: "50rem",
        });
    };

    return (
        <Box className="navbar scrolled navbar-glass">
            <Container py="0.6rem">
                <header>
                    <Group pos="relative" style={{ zIndex: 5 }} justify="space-between" h="100%">
                        <Link href="/">
                            <Image src={settings.general.settings.navbar_logo_url} alt="Logo" h={56} w="auto" />
                        </Link>

                        <Group gap="0.4rem">
                            <LanguageSwitcher settings={settings} />
                            {showBasket ? (
                                <Group gap="0.4rem">
                                    <Indicator inline size={16} label={itemCount} color="secondary" position="top-end" offset={6} disabled={!itemCount}>
                                        <ActionIcon component={Link} href="/store/checkout" variant="primary" size="xl">
                                            <TbBasket size="1.4rem" />
                                        </ActionIcon>
                                    </Indicator>
                                    <Button leftSection={<Image src={"https://minotar.net/avatar/" + user.name} alt="User" width={20} height={20} />} onClick={openLoginModal} variant="primary" size="md">
                                        {user.name.toUpperCase()}
                                    </Button>
                                </Group>
                            ) : (
                                <Button onClick={openLoginModal} size="md" leftSection={<Image src="https://minotar.net/avatar/steve" alt="Login" width={20} height={20} />} variant="primary">{t('Login')}</Button>
                            )}
                        </Group>
                    </Group>
                </header>
            </Container>
        </Box>
    );
}

