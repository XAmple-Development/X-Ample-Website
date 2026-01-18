import { Container } from "@mantine/core";
import SiteShell from "../../../components/SiteShell";

export const revalidate = 3600;

export default async function StoreLayout({ children }) {
    return (
        <SiteShell>
            <Container>
                {children}
            </Container>
        </SiteShell>
    )
}
