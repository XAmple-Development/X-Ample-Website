import { Container, Text } from '@mantine/core';
import fs from 'fs';
import path from 'path';
import { getSettings } from '../../../../utils/settingsServer';

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: "Ranks | " + settings.server.settings.server_name,
        description: "View available ranks and perks on the " + settings.server.settings.server_name + " store.",
        openGraph: {
            title: "Ranks | " + settings.server.settings.server_name,
            description: "View available ranks and perks on the " + settings.server.settings.server_name + " store.",
        }
    };
}

export default async function Page() {
    const settings = await getSettings();
    const rankTableFilename = 'RanksTable.jsx';
    const rankTablePath = path.join(process.cwd(), 'components', rankTableFilename);
    const rankTableExists = fs.existsSync(rankTablePath);
    let RankTable = null;
    if (rankTableExists) {
        const module = await import('../../../../components/' + rankTableFilename);
        RankTable = module.default;
    }
    if (!RankTable) {
        return (
            <Container pos="relative" style={{ zIndex: 10 }}>
                <Text c="red" fz="lg" ta="center" mt="xl">Ranks table addon not installed. Purchase at https://buzz.dev/shop</Text>
            </Container>
        );
    }
    return (
                <Container>
                    <RankTable settings={settings} />
                </Container>
    );
}