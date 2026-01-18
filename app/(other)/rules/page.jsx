import { Accordion, AccordionItem, AccordionControl, AccordionPanel, Card, Container, SimpleGrid, Text, Title } from "@mantine/core";
import { getTranslations } from 'next-intl/server';
import { getSettings } from "../../../utils/settingsServer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: "Rules | " + settings.server.settings.server_name,
        description: "Read the " + settings.server.settings.server_name + " server and Discord community rules.",
    };
};

export default async function RulesPage() {
    const t = await getTranslations('Rules');
    const settings = await getSettings();

    const serverRules = settings.rules.settings.rules;
    const discordRules = settings.rules.settings.discord_rules;
    const columnsAmount = Math.max(1, Number(settings.rules.settings.columns_amount) || 1);
    const splitIntoColumns = (items, columns) => {
        const cols = Array.from({ length: columns }, () => []);
        items.forEach((item, idx) => {
            cols[idx % columns].push(item);
        });
        return cols;
    };
    const serverRulesColumns = splitIntoColumns(serverRules || [], columnsAmount);
    const discordRulesColumns = splitIntoColumns(discordRules || [], columnsAmount);

    return (
        <Container>
            {serverRules && serverRules.length > 0 &&
                <Card withBorder p={{ base: "1rem", md: "1.25rem" }} mb="md">
                    <Title ta="center" mt="1rem" mb="2rem" order={3} fz={{ base: "1.2rem", md: "1.4rem" }}>{t('ServerRules')}</Title>
                    <SimpleGrid cols={{ base: 1, sm: columnsAmount }} spacing="md">
                        {serverRulesColumns.map((colItems, colIdx) => (
                            <Accordion key={`src-${colIdx}`} styles={{ item: { padding: "0.6rem", backgroundColor: "var(--mantine-color-background_alt-5) !important" } }} multiple chevronPosition="right" variant="separated">
                                {colItems.map((rule, index) => (
                                    <AccordionItem key={`sr-${colIdx}-${index}`} value={`sr-${colIdx}-${index}`}>
                                        <AccordionControl>
                                            <Text fw={600}>{t(rule.label)}</Text>
                                        </AccordionControl>
                                        <AccordionPanel>
                                            <Text>{t(rule.description)}</Text>
                                        </AccordionPanel>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ))}
                    </SimpleGrid>
                </Card>
            }

            {discordRules && discordRules.length > 0 && <Card withBorder p={{ base: "1rem", md: "1.25rem" }}>
                <Title ta="center" mt="1rem" mb="2rem" order={3} fz={{ base: "1.2rem", md: "1.4rem" }}>{t('DiscordRules')}</Title>
                <SimpleGrid cols={{ base: 1, sm: columnsAmount }} spacing="md">
                    {discordRulesColumns.map((colItems, colIdx) => (
                        <Accordion key={`drc-${colIdx}`} styles={{ item: { padding: "0.6rem", backgroundColor: "var(--mantine-color-background_alt-5) !important" } }} multiple chevronPosition="right" variant="separated">
                            {colItems.map((rule, index) => (
                                <AccordionItem key={`dr-${colIdx}-${index}`} value={`dr-${colIdx}-${index}`}>
                                    <AccordionControl>
                                        <Text fw={600}>{t(rule.label)}</Text>
                                    </AccordionControl>
                                    <AccordionPanel>
                                        <Text>{t(rule.description)}</Text>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ))}
                </SimpleGrid>
            </Card>}
        </Container>
    );
}
