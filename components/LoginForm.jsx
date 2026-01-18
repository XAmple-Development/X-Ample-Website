'use client'

import { Box, Button, Card, Group, Image, NumberInput, SimpleGrid, Text, TextInput, Title } from '@mantine/core'
import { getHotkeyHandler } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { FaArrowRight, FaDiscord } from 'react-icons/fa'
import { useBasket } from '../contexts/BasketContext'
import { useUser } from '../contexts/UserContext'

export default function LoginForm({ onLogin }) {
    const t = useTranslations('Login');
    const [username, setUsername] = useState('')
    const [discordId, setDiscordId] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useUser()
    const { updateBasket } = useBasket()
    const [platform, setPlatform] = useState('java')

    const handleLogin = async () => {
        if (username === '') {
            notifications.show({
                title: t('UsernameRequired'),
                message: t('PleaseEnterUsername'),
                color: 'red',
            })
            return
        }
        setLoading(true)

        try {
            const userResponse = await axios.get('/api/fetchUser?username=' + username + '&platform=' + platform)
            const userData = { ...userResponse.data.userData, discordId }

            const basketResponse = await fetch(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/baskets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    cancel_url: window.location.origin,
                    complete_url: `${window.location.origin}/completed`,
                })
            }).then(res => res.json())

            login(userData)
            updateBasket(basketResponse)
            modals.closeAll()

            if (discordId) {
                localStorage.setItem('discordId', discordId)
            }

            onLogin?.(userData)
        } catch (err) {
            console.log(err)
            setLoading(false)
            notifications.show({
                title: t('Error'),
                message: err.response?.data?.error || t('ErrorOccurred'),
                styles: {
                    root: {
                        backgroundColor: '#eb525c',
                        boxShadow: '0px 2px 0px 1px #6e252a'
                    },
                    title: {
                        color: '#fff',
                        fontWeight: 700,
                    },
                    closeButton: {
                        color: '#fff',
                    },
                    description: {
                        color: '#fff',
                    }
                }
            })
        }
    }

    return (
        <Box p={{base: "1rem", sm: "2rem", md: "4rem"}}>
            <Title order={2} fw={700} c='bright' mb='lg' ta='center'>{t('LoginToShop')}</Title>
            <Text ta="center" c="dimmed" size="lg" mb="xl">{t('GetStarted')}</Text>
            {true && (
                <SimpleGrid cols={{base: 1, sm: 2}} mb={16}>
                    <Card
                        p={20}
                        bg={platform === 'java' ? 'primary' : 'primary_alt'}
                        bd={platform === 'java' ? '1px solid #3a3f4a' : '1px solid #202330'}
                        onClick={() => setPlatform('java')}
                        display="flex"
                        className="pointer"
                        style={{
                            userSelect: 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            boxShadow: platform === 'java' ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(0, 0, 0, 0.2)' : 'none',
                        }}
                    >
                        <Group>
                            <Image src="/java.png" alt={t('JavaEdition')} h={42} w={42} fit="contain" />
                            <Text fw={600} size="lg" c="#fff" ta="center">{t('JavaEdition')}</Text>
                        </Group>
                    </Card>
                    <Card
                        p={20}
                        bg={platform === 'bedrock' ? 'primary' : 'primary_alt'}
                        bd={platform === 'bedrock' ? '1px solid #3a3f4a' : '1px solid #202330'}
                        onClick={() => setPlatform('bedrock')}
                        className="pointer"
                        display="flex"
                        style={{
                            userSelect: 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            boxShadow: platform === 'bedrock' ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(0, 0, 0, 0.2)' : 'none',
                        }}
                    >
                        <Group>
                            <Image src="/bedrock.png" alt={t('BedrockEdition')} h={42} w={42} fit="contain" />
                            <Text fw={600} size="lg" c="#fff" ta="center">{t('BedrockEdition')}</Text>
                        </Group>
                    </Card>
                </SimpleGrid>
            )}
            <Group wrap="nowrap" mb="0.8rem">
                <Image src="https://minotar.net/avatar/steve" alt="Minecraft" h={42} w={42} fit="contain" />
                <TextInput
                    w="100%"
                    size='lg'
                    placeholder={t('EnterUsername')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={getHotkeyHandler([["Enter", handleLogin]])}
                />
            </Group>
            <Group wrap="nowrap" mb="0.8rem">
                <FaDiscord color="#5461EB" size="2.9rem" />
                <NumberInput
                    size='md'
                    w="100%"
                    rightSection={<div />}
                    placeholder={t('DiscordIdOptional')}
                    value={discordId}
                    onChange={(e) => setDiscordId(e)}
                    onKeyDown={getHotkeyHandler([["Enter", handleLogin]])}
                />
            </Group>
            <Button rightSection={<FaArrowRight />} loading={loading} onClick={handleLogin} color='primary' fullWidth size='lg'>{t('Login')}</Button>
        </Box>
    )
}

