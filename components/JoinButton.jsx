'use client';

import { ActionIcon, Box, Button, CloseButton, Divider, Group, Image, lighten, Stack, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { TbCopy, TbCheck } from "react-icons/tb";
import { useState } from "react";
import { useTranslations } from 'next-intl';

function IPModal({ settings }) {
    const t = useTranslations('JoinModal');
    const [copied, setCopied] = useState({});
    const copyIP = (key, ip) => {
        navigator.clipboard.writeText(ip);
        setCopied((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
    }

    const hasJava = !!settings.server.settings.server_ip;
    const hasBedrock = !!settings.server.settings.server_bedrock_ip && !!settings.server.settings.server_bedrock_port;

    const javaIpField = (
        <Group wrap="nowrap" grow>
            <Tooltip label={t('javaIp')}>
                <ActionIcon maw="3rem" size="3rem" bg={"var(--mantine-color-background_alt-5)"}>
                    <Image src="/java.png" alt="Java" h={20} w={20} fit="contain" />
                </ActionIcon>
            </Tooltip>
            <TextInput
            rightSection={copied.java ? <TbCheck size="1.5rem" className="pointer" /> : <TbCopy size="1.5rem" className="pointer" onClick={() => copyIP('java', settings.server.settings.server_ip)} />}
            maw="100%"
                value={settings.server.settings.server_ip}
                readOnly
                size="lg"
                styles={{ input: { borderRadius: "4px" } }}
            />
        </Group>
    )

    const bedrockIpField = (
        <Group wrap="nowrap" grow>
            <Tooltip label={t('bedrockIp')}>
                <ActionIcon maw="3rem" size="3rem" bg={"var(--mantine-color-background_alt-5)"}>
                    <Image src="/bedrock.png" alt="Bedrock" h={20} w={20} fit="contain" />
                </ActionIcon>
            </Tooltip>
            <TextInput
            maw="100%"
                rightSection={copied.bedrock_ip ? <TbCheck size="1.5rem" className="pointer" /> : <TbCopy size="1.5rem" className="pointer" onClick={() => copyIP('bedrock_ip', settings.server.settings.server_bedrock_ip)} />}
                value={settings.server.settings.server_bedrock_ip}
                readOnly
                size="lg"
                styles={{ input: { borderRadius: "4px" } }}
            />
        </Group>
    )

    const bedrockPortField = (
        <Group wrap="nowrap" grow>
            <Tooltip label={t('bedrockPort')}>
                <ActionIcon maw="3rem" size="3rem" bg={"var(--mantine-color-background_alt-5)"}>
                    <Image src="/bedrock.png" alt="Bedrock" h={20} w={20} fit="contain" />
                </ActionIcon>
            </Tooltip>
            <TextInput
            maw="100%"
                rightSection={copied.bedrock_port ? <TbCheck size="1.5rem" className="pointer" /> : <TbCopy size="1.5rem" className="pointer" onClick={() => copyIP('bedrock_port', settings.server.settings.server_bedrock_port)} />}
                value={settings.server.settings.server_bedrock_port}
                readOnly
                size="lg"
                styles={{ input: { borderRadius: "4px" } }}
            />
        </Group>
    )
    

    return (
        <Box p={{ base: "0.6rem", sm: "3rem 2rem" }} pos="relative">
            <CloseButton color="bright" onClick={() => modals.closeAll()} pos="absolute" top="1.2rem" right="0.6rem" />
            <Title mb="1rem" ta="center" lh={1} order={3} fw={600}>{t('joinUsingIp')}</Title>
            <Text c="dimmed" ta="center">{t('useIpBelow')}</Text>
            <Stack mt="2rem">
                {hasJava && !hasBedrock && (
                    javaIpField
                )}
                {hasJava && hasBedrock && (
                    <>
                        {javaIpField}
                        {bedrockIpField}
                        {bedrockPortField}
                    </>
                )}
                {!hasJava && hasBedrock && (
                    <>
                        {bedrockIpField}
                        {bedrockPortField}
                    </>
                )}
                <Button onClick={() => modals.closeAll()} size="lg" color="primary">{t('close')}</Button>
            </Stack>
        </Box>
    )
}

export default function JoinButton({ children, settings }) {
    const t = useTranslations('JoinModal');
    const handleOpenModal = () => {
        modals.open({
            title: t('joinServer'),
            styles: {
                header: {
                    display: "none"
                }
            },
            children: <IPModal settings={settings} />,
            size: "50rem"
        });
    }

    return (
        <Box onClick={handleOpenModal}>
            {children}
        </Box>
    )
}