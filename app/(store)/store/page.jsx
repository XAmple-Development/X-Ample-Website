import { Badge, Box, Card, darken, Image, ProgressLabel, ProgressRoot, ProgressSection, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import CategoryGrid from "../../../components/CategoryGrid";
import GiftCardChecker from "../../../components/GiftCardChecker";
import PackageCard from "../../../components/PackageCard";
import SaleWidget from "../../../components/SaleWidget";
import { getSettings } from "../../../utils/settingsServer";
import { getCategories } from "../../../utils/getCategories";
import { getCommunityGoal } from "../../../utils/getCommunityGoal";
import { getFeaturedPackages } from "../../../utils/getFeaturedPackages";
import { getRecentSales } from "../../../utils/getRecentSales";
import { getSale } from "../../../utils/getSale";

export const revalidate = 3600;

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Store | PrismMC",
    description: "Browse ranks, crates and packages in the PrismMC store.",
};

export default async function Page() {
    const settings = await getSettings();
    const recentSales = await getRecentSales();
    const featuredPackages = await getFeaturedPackages();
    const sale = await getSale();
    const allCategories = await getCategories();
    const communityGoals = await getCommunityGoal();

    let topLevelCategories;
    if (settings.store.settings.home_page_categories.settings.override) {
        topLevelCategories = allCategories?.filter(category =>
            settings.store.settings.home_page_categories.settings.categories.includes(category.id.toString())
        ) || [];
    } else {
        topLevelCategories = allCategories?.filter(category => !category.parent) || [];
    }

    const t = await getTranslations('Store');
    
    return (
        <Box>
            <SaleWidget sale={sale} settings={settings} />
            <CategoryGrid categories={topLevelCategories} settings={settings} />
            <Stack>
                <Card p={{ base: "1rem", md: "2rem" }}>
                    <Title mb="1rem" ta="center" order={2}>{t("RecentDonators")}</Title>
                    <SimpleGrid cols={{ base: 1, xs: 3, sm: 4, md: 5 }}>
                        {recentSales?.length > 0 && recentSales.slice(0, 5).map((sale) => (
                            <Card key={sale?.id} bg="primary_alt" p="0.8rem 1.2rem">
                                <Stack align="center" gap="0.4rem">
                                    <Image src={"https://minotar.net/avatar/" + sale?.player?.name} alt={sale?.player?.name} w={40} h={40} />
                                    <Text ta="center" fw={700}>{sale?.player?.name}</Text>
                                    <Text c="bright" ta="center" fw={700}>{sale?.currency?.symbol}{sale?.amount}</Text>
                                </Stack>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Card>
                {communityGoals?.length > 0 && communityGoals.map((goal, index) => (
                    <Card key={index} p={{ base: "1rem", md: "2rem" }}>
                        <Title mb="1rem" ta="center" order={2}>
                            {goal?.name}
                        </Title>
                        <Box pos="relative">
                            <ProgressRoot className="community-goal" bg="var(--mantine-color-background-5)" h="2rem" autoContrast>
                                <ProgressSection style={{borderRadius: "0 5px 5px 0"}}  value={(goal?.current / goal?.target) * 100} color="primary">
                                    <ProgressLabel fz="1rem">{settings.general.settings.currency_symbol}{goal?.current}</ProgressLabel>
                                </ProgressSection>
                            </ProgressRoot>
                            <Text pos="absolute" top="-2rem" right="0" c="bright" fw={700}>{settings.general.settings.currency_symbol}{goal?.current} / {settings.general.settings.currency_symbol}{goal?.target}</Text>
                        </Box>
                    </Card>
                ))}
                <SimpleGrid mt="0.4rem" cols={{ base: 1, sm: 2, md: 3 }}>
                    {featuredPackages?.length > 0 && featuredPackages.map((pkg) => (
                        <Box key={pkg.id} pos="relative">
                            <Badge 
                            radius={4}
                                pos="absolute" 
                                top="-0.5rem" 
                                right="0.5rem" 
                                bg="primary" 
                                c="white" 
                                bd={"1px solid " + darken("var(--mantine-color-primary-5)", 0.5)}
                                style={{ zIndex: 1 }}
                            >
                                Featured
                            </Badge>
                            <PackageCard pkg={pkg} settings={settings} />
                        </Box>
                    ))}
                </SimpleGrid>
                <GiftCardChecker />
            </Stack>
        </Box>
    );
}