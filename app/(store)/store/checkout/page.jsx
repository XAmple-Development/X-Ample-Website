import { Container, Stack, Title } from "@mantine/core";
import CheckoutClient from "../../../../components/CheckoutClient";
import { getSettings } from "../../../../utils/settingsServer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: "Checkout | " + settings.server.settings.server_name,
        description: "Checkout your purchase from the " + settings.server.settings.server_name + " store.",
        openGraph: {
            title: "Checkout | " + settings.server.settings.server_name,
            description: "Checkout your purchase from the " + settings.server.settings.server_name + " store.",
        }
    };
}

export default async function Page() {
    const t = await getTranslations('Checkout');
    const settings = await getSettings();
    return (
        <Container>
            <Stack>
                <Title order={2}>{t('Checkout')}</Title>
                <CheckoutClient settings={settings} />
            </Stack>
        </Container>
    );
}


