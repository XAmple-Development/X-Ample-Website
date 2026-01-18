'use client'

import { ActionIcon, Button, Card, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { TbGift } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

export default function GiftCardChecker() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [enterCodeModalOpen, setEnterCodeModalOpen] = useState(false)
    const [resultModalOpen, setResultModalOpen] = useState(false)
    const [balance, setBalance] = useState(null)
    const t = useTranslations('Store')

    const handleCheck = async () => {
        if (!code) {
            notifications.show({
                title: t("Error"),
                message: 'Please enter a gift card code',
                color: 'red'
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/checkGiftCard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            setBalance(data.data.balance)
            setEnterCodeModalOpen(false)
            setResultModalOpen(true)
        } catch (error) {
            notifications.show({
                title: t("Error"),
                message: error.message,
                styles: {
                    root: {
                        backgroundColor: "var(--mantine-color-primary-5)",
                    },
                    title: {
                        color: "#fff",
                        fontWeight: 700,
                    },
                    closeButton: {
                        color: "#fff",
                    },
                    description: {
                        color: "#fff",
                    }
                }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card p={{ base: "1rem", md: "2rem" }}>
                <Title mb="1rem" order={2} ta="center" c="bright" fw={800}>{t('CheckGiftCard')}</Title>
                <Group wrap="nowrap" w="100%">
                    <TextInput w="100%" size="xl" placeholder={t('EnterGiftCardCode')} onChange={(e) => setCode(e.target.value)} />
                    <Button miw="8rem" size="xl" onClick={handleCheck} variant="primary">{t('Check')}</Button>
                </Group>
            </Card>

                <Modal title={<Title order={3} ta="center" c="bright" fw={800} my="1.3rem">{t('EnterGiftCardCode')}</Title>} opened={enterCodeModalOpen} onClose={() => setEnterCodeModalOpen(false)} size="50rem" padding="3rem">
                <TextInput
                    mt="2rem"
                    leftSection={<TbGift size="1.4rem" />}
                    placeholder={t('EnterGiftCardCode')}
                    size="xl"
                    onChange={(e) => setCode(e.target.value)}
                />
                <Button
                    color="primary"
                    fullWidth
                    mt="1rem"
                    size="xl"
                    fw={700}
                    loading={loading}
                    onClick={handleCheck}
                >
                    {t('Check')}
                </Button>
            </Modal>

            <Modal title={<Title order={3} ta="center" c="bright" fw={800} my="1.3rem">{t('GiftCardBalance')}</Title>} opened={resultModalOpen} onClose={() => setResultModalOpen(false)} size="50rem" padding="3rem">
                {balance && (
                    <Stack mt="1rem">
                        <Title order={2} c="bright" fw={600}>{t('Balance')}: {balance.currency} {balance.remaining}</Title>
                        <Text size="sm" c="dimmed">{t('OriginalAmount')}: {balance.currency} {balance.starting}</Text>
                        <Button color="primary" fullWidth size="lg" fw={700} onClick={() => setResultModalOpen(false)}>{t('Okay')}</Button>
                    </Stack>
                )}
            </Modal>
        </>
    )
} 
