'use client'

import { Anchor, Button, CloseButton, Group, Image, Modal, Paper, Popover, PopoverDropdown, PopoverTarget, Stack, Text, TextInput, Transition } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { TbBasket, TbChevronDown, TbNews, TbSettings } from 'react-icons/tb';

export default function DemoPopup() {
    if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") {
        return null;
    }

    const [visible, setVisible] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isShown, setIsShown] = useLocalStorage({
        key: 'prism-demo-popup',
        defaultValue: true
    });

    const form = useForm({
        initialValues: {
            publicKey: ''
        },
        validate: {
            publicKey: (value) => value.trim().length === 0 ? 'Public key is required' : null
        }
    });

    const handleClose = () => {
        setVisible(false);
        setIsShown(false);
    };

    const handleTebexKeySubmit = async (values) => {
        setLoading(true);
        try {
            document.cookie = `demo-tebex-public-key=${values.publicKey}; path=/; max-age=${60 * 60 * 24 * 30}`;
            setModalOpened(false);
            window.location.href = "/store"
        } catch (error) {
            console.error('Error setting cookie:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isShown === true) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [isShown]);

    return (
        <>
            <Transition
                mounted={visible}
            >
                {(styles) => (
                    <Paper
                        visibleFrom="xs"
                        p="1rem"
                        radius="15px 15px 0 0"
                        pos="fixed"
                        shadow="lg"
                        bg="background"
                        bottom="1rem"
                        style={{
                            ...styles,
                            zIndex: 10,
                            transform: 'translate(-50%, 1rem)',
                            left: '50%',
                            transition: 'opacity 0.3s ease'
                        }}
                        w="90%"
                        maw="69rem"
                    >
                        <Group gap="2rem">
                            <Anchor href="https://www.buzz.dev" target="_blank">
                                <Image radius={0} src="https://www.buzz.dev/logo_shop_light.svg" alt="Buzz.dev logo" w="6rem" h="auto" />
                            </Anchor>
                            <Text c="#fff">You're viewing the demo of <Text inherit span fw={700} c="primary">Prism</Text></Text>
                            <Group gap="0.8rem">
                                <Button color="secondary" variant="outline" onClick={() => setModalOpened(true)}>
                                    Try with your Tebex packages
                                </Button>
                                <Popover>
                                    <PopoverTarget>
                                        <Button rightSection={<TbChevronDown size="1.2rem" />}>Make this yours!</Button>
                                    </PopoverTarget>
                                    <PopoverDropdown>
                                        <Stack gap="0.4rem">
                                            <Button td="none" leftSection={<Image radius={0} src="https://www.buzz.dev/icons/favicons/shop/android-chrome-512x512.png" alt="Buzz.dev logo" w="1.2rem" h="auto" />} component={Anchor} target="_blank" href="https://www.buzz.dev/shop/products/prism-all-in-one-minecraft-website">Purchase on main website</Button>
                                            <Button td="none" variant="outline" leftSection={<Image radius={0} src="/system/builtbybitlogo.svg" alt="Built by Bit logo" w="1.2rem" h="auto" />} component={Anchor} target="_blank" href="https://builtbybit.com/prism/">Purchase on BuiltByBit</Button>
                                            <Text c="dimmed" ta="center" size="sm">or</Text>
                                            <Button td="none" leftSection={<Image radius={0} src="/system/Bitcoin.svg.webp" alt="Bitcoin logo" w="1.4rem" h="auto" />} component={Anchor} target="_blank" href="https://discord.gg/buzz">Purchase via Discord</Button>
                                        </Stack>
                                    </PopoverDropdown>
                                </Popover>
                                <Popover>
                                    <PopoverTarget>
                                        <Button variant="outline" rightSection={<TbChevronDown size="1.2rem" />}>Explore features</Button>
                                    </PopoverTarget>
                                    <PopoverDropdown>
                                        <Stack gap="0.4rem">
                                            <Button td="none" component={Anchor} href="/store" c="#fff" leftSection={<TbBasket size="1.2rem" />}>Store page</Button>
                                            <Button td="none" component={Anchor} href="/admin" c="#fff" leftSection={<TbSettings size="1.2rem" />}>Admin panel</Button>
                                            <Button td="none" component={Anchor} href="/blog" c="#fff" leftSection={<TbNews size="1.2rem" />}>Blog</Button>
                                        </Stack>
                                    </PopoverDropdown>
                                </Popover>
                            </Group>
                            <CloseButton pos="absolute" top="0.6rem" right="0.6rem" onClick={handleClose} c="gray.4" variant="transparent" />
                        </Group>
                    </Paper>
                )}
            </Transition>

            <Modal
                opened={modalOpened}
                styles={{
                    header: {
                        display: "none"
                    }
                }}
                onClose={() => setModalOpened(false)}
                title="Try with your Tebex packages"
                centered
            >
                <form onSubmit={form.onSubmit(handleTebexKeySubmit)}>
                    <Stack pt="1rem" gap="md">
                        <Text c="dimmed">
                            Enter your <Anchor c="primary" target="_blank" href="https://creator.tebex.io/developers/api-keys">Tebex Public Token</Anchor> to view your own packages and categories instead of the demo data.
                        </Text>
                        <TextInput
                            label="Tebex Public Token"
                            placeholder="Enter your Tebex public token"
                            {...form.getInputProps('publicKey')}
                            required
                        />
                        <Group justify="space-between" gap="sm">
                            <Button variant="outline" onClick={() => setModalOpened(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                Apply
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
