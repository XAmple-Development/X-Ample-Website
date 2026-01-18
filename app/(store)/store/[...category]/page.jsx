import { Anchor, Box, Card, Group, ProgressLabel, ProgressRoot, ProgressSection, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CategoryGrid from "../../../../components/CategoryGrid";
import GiftCardChecker from "../../../../components/GiftCardChecker";
import PackageCard from "../../../../components/PackageCard";
import { getSettings } from "../../../../utils/settingsServer";
import { getCategories } from "../../../../utils/getCategories";
import { getCommunityGoal } from "../../../../utils/getCommunityGoal";
import { getSale } from "../../../../utils/getSale";
import { tebexClient } from "../../../../utils/tebexClient";
import SaleWidget from "../../../../components/SaleWidget";
import { TbArrowLeft } from "react-icons/tb";
import BrowseButton from "../../../../components/BrowseButton";
import { cookies } from "next/headers";

export const revalidate = 3600;

export default async function Page({ params }) {
    const { category } = await params;
    const slugs = Array.isArray(category) ? category : [category].filter(Boolean);
    const settings = await getSettings();

    const [sale, allCategories, communityGoals, t] = await Promise.all([
        getSale(),
        getCategories(),
        getCommunityGoal(),
        getTranslations('Store')
    ]);

    const getParentId = (cat) => (cat && cat.parent && cat.parent.id) ? cat.parent.id : null;

    let selectedCategory = null;
    let currentParentId = null;
    for (const slug of slugs) {
        const nextCategory = allCategories.find(c => c.slug === slug && ((getParentId(c)) === (currentParentId === null ? null : currentParentId)));
        if (!nextCategory) break;
        selectedCategory = nextCategory;
        currentParentId = nextCategory.id;
    }

    let childCategories = [];
    if (selectedCategory) {
        childCategories = allCategories.filter(c => getParentId(c) === selectedCategory.id);
    }

    let categoryPackages = [];
    if (selectedCategory) {
        const cookieStore = await cookies();
        const res = await tebexClient(`categories/${selectedCategory.id}?includePackages=1`, cookieStore);
        categoryPackages = res?.data?.packages || [];
    }

    const parentPath = slugs.length > 1 ? `/store/${slugs.slice(0, -1).join('/')}` : '/store';
    const currentPath = `/store/${slugs.join('/')}`;
    const parentCategory = selectedCategory ? (selectedCategory.parent || null) : null;

    return (
        <Box>
            <BrowseButton categories={allCategories} />
            {selectedCategory && (
                <Group mb="0.8rem" gap="0.6rem">
                    {parentCategory && (
                        <Anchor component={Link} href={parentPath} c="bright">
                            <Group gap="0.4rem">
                                <TbArrowLeft size="1.2rem" />
                                <Text>{t('BackTo')} {parentCategory.name}</Text>
                            </Group>
                        </Anchor>
                    )}
                    {!parentCategory && (
                        <Anchor component={Link} href="/store" c="bright">
                            <Group gap="0.4rem">
                                <TbArrowLeft size="1.2rem" />
                                <Text>{t('BackToStore')}</Text>
                            </Group>
                        </Anchor>
                    )}
                </Group>
            )}

            <SaleWidget sale={sale} settings={settings} />

            {childCategories.length > 0 && (
                <CategoryGrid categories={childCategories} basePath={currentPath} disableLimit settings={settings} />
            )}

            <Stack>
                <SimpleGrid cols={{ base: 1, sm: 2, md: settings.store.settings.package_listing_columns || 3 }}>
                    {categoryPackages.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} settings={settings} />
                    ))}
                </SimpleGrid>
                {communityGoals?.map((goal, index) => (
                    <Card key={index} p={{ base: "1rem", md: "2rem" }}>
                        <Title mb="1rem" ta="center" order={2}>{goal.name}</Title>
                        <Box pos="relative">
                            <ProgressRoot className="community-goal" bg="var(--mantine-color-background-5)" h="2rem" autoContrast>
                                <ProgressSection style={{ borderRadius: "0 5px 5px 0" }} value={(goal.current / goal.target) * 100} color="primary">
                                    <ProgressLabel fz="1rem">{settings.general.settings.currency_symbol}{goal.current}</ProgressLabel>
                                </ProgressSection>
                            </ProgressRoot>
                            <Text pos="absolute" top="-2rem" right="0" c="bright" fw={700}>{settings.general.settings.currency_symbol}{goal.current} / {settings.general.settings.currency_symbol}{goal.target}</Text>
                        </Box>
                    </Card>
                ))}
                <GiftCardChecker />
            </Stack>
        </Box>
    );
}

export async function generateMetadata({ params }) {
    const { category } = await params;
    const slugs = Array.isArray(category) ? category : [category].filter(Boolean);
    const last = slugs[slugs.length - 1] || 'Store';
    const uppercase = last.charAt(0).toUpperCase() + last.slice(1).replaceAll("-", " ");
    const settings = await getSettings();
    return {
        title: uppercase + " | Store | " + settings.server.settings.server_name,
        description: "Browse " + uppercase + " in the " + settings.server.settings.server_name + " store!",
        openGraph: {
            title: uppercase + " | Store | " + settings.server.settings.server_name,
            description: "Browse " + uppercase + " in the " + settings.server.settings.server_name + " store!",
        }
    };
}


