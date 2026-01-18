'use client';

import { Carousel } from "@mantine/carousel";
import { ActionIcon, Box, Card, Center, darken, Group, Image, Modal, ScrollArea, SimpleGrid, Text, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import parse from "html-react-parser";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { TbArrowLeft, TbArrowRight, TbGift } from "react-icons/tb";
import { useBasket } from "../contexts/BasketContext";
import AddToCartButton from "./AddToCartButton";
import GiftPackageModal from "./GiftPackageModal";
import LoginForm from "./LoginForm";

export default function PackageCard({ pkg, settings, variation, children, disabled }) {
    const [opened, setOpened] = useState(false);
    const { basket, addToBasket } = useBasket();
    const [qtyLoading, setQtyLoading] = useState({});
    const t = useTranslations('Store');
    const quantities = [1, 5, 10, 25];
    const quantityEnabledIds = (settings?.store?.settings?.package_variations?.package_ids_with_quantity_selection || []).map((v) => String(v));
    const isQuantityMode = quantityEnabledIds.includes(String(pkg?.id));

    const handleQuickAdd = async (e, quantity) => {
        e.stopPropagation();
        setQtyLoading((s) => ({ ...s, [quantity]: true }));
        try {
            if (!basket?.data?.ident) {
                modals.open({
                    children: <LoginForm onLogin={() => window.location.reload()} />,
                    withCloseButton: false,
                    onClose: () => setQtyLoading((s) => ({ ...s, [quantity]: false })),
                    size: "50rem",
                });
                return;
            }
            const data = await addToBasket(basket.data.ident, pkg.id, quantity);
            notifications.show({
                title: t('ProductAdded'),
                message: data.message,
                styles: {
                    root: { backgroundColor: "var(--mantine-color-primary-5)", boxShadow: "0px 2px 0px 1px " + darken("var(--mantine-color-primary-5)", 0.5) },
                    title: { color: "#000", fontWeight: 700 },
                    closeButton: { color: "#000" },
                    description: { color: "#000" }
                }
            });
        } catch (error) {
            notifications.show({
                title: t('Error'),
                message: error.message,
                styles: {
                    root: { backgroundColor: "#eb525c", boxShadow: "0px 2px 0px 1px #6e252a" },
                    title: { color: "#fff", fontWeight: 700 },
                    closeButton: { color: "#fff" },
                    description: { color: "#fff" }
                }
            });
        } finally {
            setQtyLoading((s) => ({ ...s, [quantity]: false }));
        }
    };

    const modalPopup = (
        <Modal styles={{ header: { display: "none" } }} padding="0" size="70rem" opened={opened} onClose={() => setOpened(false)}>
            <SimpleGrid p={{ base: "1rem", sm: "2rem" }} cols={{ base: 1, sm: 2 }} c="bright">
                <Card withBorder bg="#0E1118" p="2rem">
                    <Center h="100%">
                        {pkg.media && pkg.media.length > 0 ? (
                            <Carousel
                                nextControlProps={{
                                    style: {
                                        marginRight: "-2rem"
                                    }
                                }}
                                previousControlProps={{
                                    style: {
                                        marginLeft: "-2rem"
                                    }
                                }}
                                nextControlIcon={<ActionIcon variant="primary" size="md"><TbArrowRight /></ActionIcon>}
                                previousControlIcon={<ActionIcon variant="primary" size="md"><TbArrowLeft /></ActionIcon>}
                                w="100%" withIndicators>
                                {pkg.media.map((media, index) => (
                                    <Carousel.Slide key={index}>
                                        {media.type === 'video' ? (
                                            <video
                                                src={media.url}
                                                alt={media.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                controls
                                            />
                                        ) : (
                                            <Image
                                                src={media.url}
                                                alt={media.name}
                                                h="100%"
                                                mah="23rem"
                                                w="100%"
                                                fit="contain"
                                            />
                                        )}
                                    </Carousel.Slide>
                                ))}
                            </Carousel>
                        ) : (
                            <Image fit="contain" src={pkg.image} alt={pkg.name} h="22rem" w="auto" />
                        )}
                    </Center>
                </Card>
                <Box pl="2rem">
                    <Title ta="center" fz="2rem" order={2}>{pkg.name}</Title>
                    {pkg.description && (
                        <ScrollArea type="always" pt="1rem" offsetScrollbars h="20rem">
                            <Box c="auto">
                                {parse(pkg.description)}
                            </Box>
                        </ScrollArea>
                    )}
                    <Card p="0.6rem" mb="0.8rem">
                        <Text ta="center" size="lg" c="#fff">
                            {pkg.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.general?.settings?.currency_symbol || '$'}{pkg.total_price + pkg.discount}</Text>}
                            &nbsp;{settings.general.settings.currency_symbol}{pkg.total_price}
                        </Text>
                    </Card>
                    {isQuantityMode ? (
                        <Group gap="xs" wrap="nowrap" w="100%" mt="0.8rem">
                            <Group grow gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                                {quantities.map((q) => (
                                    <Tooltip key={q} label={`Add ${q} to cart`}>
                                        <ActionIcon bg="primary_alt" bd="1px solid var(--mantine-color-background-5)" size="xl" w={56} loading={!!qtyLoading[q]} onClick={(e) => handleQuickAdd(e, q)}>
                                            <Text c="#fff" fw={700}>{q}x</Text>
                                        </ActionIcon>
                                    </Tooltip>
                                ))}
                            </Group>
                            {!pkg.disable_gifting && (
                                <Tooltip label="Gift this package">
                                    <ActionIcon bg="primary_alt" bd="1px solid var(--mantine-color-background-5)" size="xl" w={42} onClick={(e) => {
                                        e.stopPropagation();
                                        if (!basket?.data?.ident) {
                                            modals.open({
                                                children: <LoginForm onLogin={() => window.location.reload()} />,
                                                withCloseButton: false,
                                                size: "50rem",
                                            });
                                            return;
                                        }
                                        modals.open({
                                            title: "Gift this package",
                                            styles: {
                                                header: {
                                                    display: "none"
                                                }
                                            },
                                            children: <GiftPackageModal basketIdent={basket?.data?.ident} packageId={pkg.id} onComplete={() => setOpened(false)} />,
                                            size: "34rem",
                                            padding: "2rem"
                                        })
                                    }}>
                                        <TbGift color="#fff" />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    ) : (
                        <Group mt="0.8rem" w="100%" wrap="nowrap">
                            <AddToCartButton onComplete={() => setOpened(false)} package_id={pkg.id} category_id={pkg.category_id} />
                            {!pkg.disable_gifting && (
                                <Tooltip label="Gift this package">
                                    <ActionIcon bg="primary_alt" bd="1px solid var(--mantine-color-background-5)" size="xl" w={42} onClick={(e) => {
                                        e.stopPropagation();
                                        if (!basket?.data?.ident) {
                                            modals.open({
                                                children: <LoginForm onLogin={() => window.location.reload()} />,
                                                withCloseButton: false,
                                                size: "50rem",
                                            });
                                            return;
                                        }
                                        modals.open({
                                            title: "Gift this package",
                                            styles: {
                                                header: {
                                                    display: "none"
                                                }
                                            },
                                            children: <GiftPackageModal basketIdent={basket?.data?.ident} packageId={pkg.id} onComplete={() => setOpened(false)} />,
                                            size: "34rem",
                                            padding: "2rem"
                                        })
                                    }}>
                                        <TbGift color="#fff" />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    )}
                </Box>
            </SimpleGrid>
        </Modal>
    )

    if (variation === "rank-upgrader") {
        return (
            <>
                <Box className="pointer" radius={0}>
                    <Box onClick={(e) => {
                        if (disabled) return;
                        setOpened(true)
                    }}>
                        {children}
                    </Box>
                </Box>
                {modalPopup}
            </>
        )
    }

    if (variation === "ranks-table") {
        return (
            <>
                <Box className="pointer" h="20rem" radius={0}>
                    <Box onClick={(e) => {
                        setOpened(true)
                    }}>
                        <Text mb="0.4rem" c="bright" size="xl" ta="center" fw={900}>{pkg.name || pkg.label}</Text>
                        <Card bg="primary_alt" mb="0.4rem" py="0.4rem">
                            <Image mx="auto" mb="1rem" src={pkg.image} alt={pkg.name} h="9.4rem" w="auto" fit="contain" />
                        </Card>
                        <Card bg="primary_alt" py="0.2rem">
                            <Text c="bright" ta="center" fz="1.2rem" fw={700}>{pkg.total_price || "???"} {pkg.currency}</Text>
                        </Card>
                    </Box>
                    <Box my="1rem">
                        <AddToCartButton extraProps={{ size: "sm", color: "#282C42", c: "#fff" }} quantity={1} package_id={pkg.package_id || pkg.id} />
                    </Box>
                </Box>
                {modalPopup}
            </>
        )
    }


    return (
        <>
            <Card h="fit-content" onClick={(e) => {
                setOpened(true)
            }} p="0.8rem 1rem" className="pointer">
                <Title ta="center" my="0.4rem" mb="0.8rem" order={2}>{pkg.name}</Title>
                <Image p="2rem" bg="primary_alt" bd="1px solid var(--mantine-color-background-5)" fit="contain" src={pkg.image} alt={pkg.name} h="20rem" w="auto" />
                <Text ta="center" mt="0.8rem" size="lg" c="#fff">
                    {pkg.discount !== 0 && <Text c="red.5" inherit inline span td="line-through">{settings.general?.settings?.currency_symbol || '$'}{pkg.total_price + pkg.discount}</Text>}
                    &nbsp;{settings.general.settings.currency_symbol}{pkg.total_price}
                </Text>
                {isQuantityMode ? (
                    <Group mt="0.8rem" grow gap="xs" wrap="nowrap" w="100%">
                        {quantities.map((q) => (
                            <Tooltip key={q} label={`Add ${q} ${pkg.name} to cart`}>
                                <ActionIcon bg="primary" bd="1px solid var(--mantine-color-background-5)" size="xl" w={56} loading={!!qtyLoading[q]} onClick={(e) => handleQuickAdd(e, q)}>
                                    <Text c="#fff" fw={700}>{q}x</Text>
                                </ActionIcon>
                            </Tooltip>
                        ))}
                    </Group>
                ) : (
                    <Box mt="0.8rem">
                        <AddToCartButton package_id={pkg.id} category_id={pkg.category_id} />
                    </Box>
                )}
            </Card >

            {modalPopup}
        </>
    )
}