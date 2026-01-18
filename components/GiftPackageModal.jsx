'use client'

import { Button, Group, Stack, TextInput, Title, Text, Image } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useBasket } from "../contexts/BasketContext";
import { useTranslations } from "next-intl";

export default function GiftPackageModal({ basketIdent, packageId, onComplete }) {
    const { addToBasket } = useBasket();
    const t = useTranslations('Store');
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        const trimmed = username.trim();
        if (!trimmed || trimmed.length < 2) {
            setError("Please enter a valid username");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const data = await addToBasket(basketIdent, packageId, 1, { target_username: trimmed });
            notifications.show({
                title: "Gift added",
                message: data.message,
                styles: {
                    title: {
                        color: "#000"
                    },
                    description: {
                        color: "#000"
                    }
                }
            });
            if (onComplete) onComplete();
            modals.closeAll();
        } catch (e) {
            notifications.show({
                title: "Error",
                message: e.message,
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack>
            <Text mt="2rem" mb="1rem" size="lg" fw={700}>{t('GiftPackage')}</Text>
            <Group wrap="nowrap" mb="0.8rem">
                <Image src="https://minotar.net/avatar/steve" alt="Minecraft" h={42} w={42} fit="contain" />
                <TextInput
                    w="100%"
                    size="lg"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    error={error}
                />
            </Group>
            <Group justify="space-between">
                <Button variant="default" onClick={() => modals.closeAll()}>Cancel</Button>
                <Button onClick={handleSubmit} type="submit" loading={loading}>Gift package</Button>
            </Group>
        </Stack>
    );
}


