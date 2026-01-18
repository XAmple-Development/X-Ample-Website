'use client'

import { ActionIcon, Box, Button, Card, Group, Image, NumberFormatter, Stack, Text, TextInput, Grid, Badge, Popover } from "@mantine/core";
import { useBasket } from "../contexts/BasketContext";
import { useMemo, useState } from "react";
import { TbMinus, TbPlus, TbX } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";

export default function CheckoutClient({ settings }) {
    const { basket, updateQuantity, removeFromBasket, applyCoupon, applyGiftCard, applyCreatorCode, removeCoupon, removeGiftCard, removeCreatorCode } = useBasket();
    const [loadingId, setLoadingId] = useState(null);
    const tStoreExtra = useTranslations('StoreExtra');
    const [couponCode, setCouponCode] = useState("");
    const [giftCard, setGiftCard] = useState("");
    const [creatorCodeInput, setCreatorCodeInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [removingKey, setRemovingKey] = useState(null);

    const subtotal = useMemo(() => {
        if (typeof basket?.data?.total_price === 'number') return basket.data.total_price;
        return basket?.data?.packages?.reduce((acc, p) => acc + (p.in_basket.price * p.in_basket.quantity), 0) || 0;
    }, [basket]);

    const currency = basket?.data?.currency || "USD";
    const basketIdent = basket?.data?.ident;

    const handleUpdate = async (pkgId, nextQty, maxOne = false) => {
        setLoadingId(pkgId);
        if (maxOne && nextQty > 1) {
            nextQty = 1;
        }
        if (nextQty < 1) {
            await removeFromBasket(basketIdent, pkgId);
            setLoadingId(null);
            return;
        }
        await updateQuantity(basketIdent, pkgId, nextQty);
        setLoadingId(null);
    };

    const checkoutUrl = basket?.data?.links?.checkout;
    const coupons = Array.isArray(basket?.data?.coupons) ? basket.data.coupons : [];
    const creatorCode = basket?.data?.creator_code;
    const giftcards = Array.isArray(basket?.data?.giftcards) ? basket.data.giftcards : [];

    return (
        <>
            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack>
                        <Card p={{ base: "0.6rem", sm: "1rem" }}>
                            <Stack gap="sm">
                                {basket?.data?.packages?.map((pkg) => (
                                    <Card key={pkg.id} bg="primary_alt" bd="1px solid var(--mantine-color-background-5)">
                                        <Group wrap="nowrap" justify="space-between" align="center">
                                            <Group wrap="nowrap" gap="md" align="center">
                                                <Image src={pkg.image} alt={pkg.name} w={56} h={56} fit="contain" />
                                                <Box>
                                                    <Text c="bright" fw={700}>{pkg.name}</Text>
                                                    {pkg.in_basket?.gift_username && (
                                                        <Text fz="xs" c="dimmed">{tStoreExtra('GiftPrefix')}{pkg.in_basket.gift_username}</Text>
                                                    )}
                                                </Box>
                                            </Group>
                                            <Group gap="lg" align="center">
                                                {pkg.in_basket?.gift_username && (
                                                    <Image src={`https://minotar.net/avatar/${pkg.in_basket.gift_username}`} alt={pkg.in_basket.gift_username} w={26} h={26} fit="contain" bg="background.5" />
                                                )}
                                <Text fw={700}><NumberFormatter value={pkg.in_basket.price * pkg.in_basket.quantity} decimalScale={2} /> {currency}</Text>
                                                <Group gap={6} align="center">
                                                    <ActionIcon loading={loadingId === pkg.id} h={30} w={34} variant="subtle" c="#fff" onClick={() => handleUpdate(pkg.id, pkg.in_basket.quantity - 1)}><TbMinus /></ActionIcon>
                                                    <Text w={18} ta="center">{pkg.in_basket.quantity}</Text>
                                                    <ActionIcon loading={loadingId === pkg.id} h={30} w={34} variant="subtle" c="#fff" disabled={!!pkg.disable_quantity} onClick={() => handleUpdate(pkg.id, pkg.in_basket.quantity + 1, !!pkg.disable_quantity)}><TbPlus /></ActionIcon>
                                                </Group>
                                            </Group>
                                        </Group>
                                    </Card>
                                ))}
                                {(!basket?.data?.packages || basket.data.packages.length === 0) && (
                                    <Text py="4rem" ta="center">{tStoreExtra('BasketEmpty')}</Text>
                                )}
                            </Stack>
                        </Card>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                        <Card p={{ base: "0.6rem", sm: "1rem" }}>
                            <Stack gap="sm">
                                <Group justify="space-between">
                                    <Text size="xl" c="bright" fw={700}>{tStoreExtra('Total')}</Text>
                                    <Text size="xl" c="bright" fw={800}><NumberFormatter value={subtotal} decimalScale={2} /> {currency}</Text>
                                </Group>
                                {Array.isArray(coupons) && coupons.length > 0 && (
                                    <Group justify="space-between" align="center">
                                        <Text c="dimmed">{tStoreExtra('Coupons')}</Text>
                                        {coupons.length === 1 ? (
                                            <Badge rightSection={
                                                <ActionIcon size="xs" variant="subtle" c="#fff" onClick={async () => {
                                                    if (!basketIdent) return;
                                                    setRemovingKey('coupon-single');
                                                    try {
                                                        await removeCoupon(basketIdent);
                                                    } catch (err) {
                                                        notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to remove coupon' });
                                                    } finally {
                                                        setRemovingKey(null);
                                                    }
                                                }} loading={removingKey === 'coupon-single'}><TbX /></ActionIcon>
                                            }>
                                                {coupons[0]?.coupon_code || 'Coupon'}
                                            </Badge>
                                        ) : (
                                            <Popover position="bottom-end" withArrow shadow="md">
                                                <Popover.Target>
                                                    <Badge className="pointer">{coupons.length} coupons</Badge>
                                                </Popover.Target>
                                                <Popover.Dropdown p="sm" bg="primary_alt" bd="none" shadow="md">
                                                    <Stack gap={8}>
                                                        {coupons.map((c, idx) => (
                                                            <Badge key={`coupon-list-${c.coupon_code || idx}`} bg="background.5">{c.coupon_code || 'Coupon'}</Badge>
                                                        ))}
                                                    </Stack>
                                                </Popover.Dropdown>
                                            </Popover>
                                        )}
                                    </Group>
                                )}
                                {creatorCode && (
                                    <Group justify="space-between" align="center">
                                        <Text c="dimmed">{tStoreExtra('CreatorCode')}</Text>
                                        <Badge rightSection={
                                            <ActionIcon size="xs" variant="subtle" c="#fff" onClick={async () => {
                                                if (!basketIdent) return;
                                                setRemovingKey('creator');
                                                try {
                                                    await removeCreatorCode(basketIdent);
                                                } catch (err) {
                                                    notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to remove creator code' });
                                                } finally {
                                                    setRemovingKey(null);
                                                }
                                            }} loading={removingKey === 'creator'}><TbX /></ActionIcon>
                                        }>
                                            {creatorCode}
                                        </Badge>
                                    </Group>
                                )}
                                {Array.isArray(giftcards) && giftcards.length > 0 && (
                                    <Group justify="space-between" align="center">
                                        <Text c="dimmed">{tStoreExtra('GiftCards')}</Text>
                                        {giftcards.length === 1 ? (
                                            (() => {
                                                const gc = giftcards[0];
                                                const label = gc.card_number || gc.number || gc.masked || gc.code || 'Gift card';
                                                const canRemove = Boolean(gc.card_number || gc.number || gc.code);
                                                return (
                                                    <Badge rightSection={
                                                        <ActionIcon size="xs" variant="subtle" c="#fff" onClick={async () => {
                                                            if (!basketIdent || !canRemove) return;
                                                            setRemovingKey('giftcard-single');
                                                            try {
                                                                await removeGiftCard(basketIdent, gc.card_number || gc.number || gc.code);
                                                            } catch (err) {
                                                                notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to remove gift card' });
                                                            } finally {
                                                                setRemovingKey(null);
                                                            }
                                                        }} disabled={!canRemove} loading={removingKey === 'giftcard-single'}><TbX /></ActionIcon>
                                                    }>
                                                        {label}
                                                    </Badge>
                                                );
                                            })()
                                        ) : (
                                            <Popover position="bottom-end" withArrow shadow="md">
                                                <Popover.Target>
                                                    <Badge className="pointer">{giftcards.length} gift cards</Badge>
                                                </Popover.Target>
                                                <Popover.Dropdown p="sm" bg="primary_alt" bd="1px solid var(--mantine-color-background-5)">
                                                    <Stack gap={8}>
                                                        {giftcards.map((gc, idx) => {
                                                            const label = gc.card_number || gc.number || gc.masked || gc.code || `Gift card ${idx + 1}`;
                                                            return (
                                                                <Badge key={`gc-list-${label}-${idx}`} bg="background.5">{label}</Badge>
                                                            );
                                                        })}
                                                    </Stack>
                                                </Popover.Dropdown>
                                            </Popover>
                                        )}
                                    </Group>
                                )}
                            </Stack>
                        </Card>
                        <Card p={{ base: "0.6rem", sm: "1rem" }}>
                            <Stack gap="sm">
                                <Group wrap="nowrap" gap="xs">
                                    <TextInput flex={1} placeholder={tStoreExtra('CouponCode')} value={couponCode} onChange={(e) => setCouponCode(e.currentTarget.value)} />
                                    <Button loading={submitting} onClick={async () => {
                                        if (!basketIdent || !couponCode) return;
                                        setSubmitting(true);
                                        try {
                                            await applyCoupon(basketIdent, couponCode);
                                            setCouponCode("");
                                        } catch (err) {
                                            notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to apply coupon' });
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}>{tStoreExtra('Apply')}</Button>
                                </Group>
                                <Group wrap="nowrap" gap="xs">
                                    <TextInput flex={1} placeholder={tStoreExtra('GiftCardNumber')} value={giftCard} onChange={(e) => setGiftCard(e.currentTarget.value)} />
                                    <Button loading={submitting} onClick={async () => {
                                        if (!basketIdent || !giftCard) return;
                                        setSubmitting(true);
                                        try {
                                            await applyGiftCard(basketIdent, giftCard);
                                            setGiftCard("");
                                        } catch (err) {
                                            notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to apply gift card' });
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}>{tStoreExtra('Apply')}</Button>
                                </Group>
                                <Group wrap="nowrap" gap="xs">
                                    <TextInput flex={1} placeholder={tStoreExtra('CreatorCode')} value={creatorCodeInput} onChange={(e) => setCreatorCodeInput(e.currentTarget.value)} />
                                    <Button loading={submitting} onClick={async () => {
                                        if (!basketIdent || !creatorCodeInput) return;
                                        setSubmitting(true);
                                        try {
                                            await applyCreatorCode(basketIdent, creatorCodeInput);
                                            setCreatorCodeInput("");
                                        } catch (err) {
                                            notifications.show({ styles: { title: { color: '#000' }, description: { color: '#000' } }, color: 'red', title: 'Error', message: err?.message || 'Failed to apply creator code' });
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}>{tStoreExtra('Apply')}</Button>
                                </Group>
                            </Stack>
                        </Card>
                        <Card>
                    <Button component="a" href={checkoutUrl || "#"} disabled={!checkoutUrl} size="md">
                                {tStoreExtra('ProceedToCheckout')}
                            </Button>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
            <Group grow>
                <Card bg="primary_alt" bd="1px solid var(--mantine-color-background-5)">
                    <Button fullWidth variant="light" component="a" href="https://checkout.tebex.io/privacy" target="_blank" rel="noopener noreferrer">{tStoreExtra('PrivacyPolicy')}</Button>
                </Card>
                <Card bg="primary_alt" bd="1px solid var(--mantine-color-background-5)">
                    <Button fullWidth variant="light" component="a" href="https://checkout.tebex.io/impressum" target="_blank" rel="noopener noreferrer">{tStoreExtra('Impressum')}</Button>
                </Card>
            </Group>
        </>
    );
}


