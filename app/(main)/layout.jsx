import SiteShell from "../../components/SiteShell";

export const dynamicParams = false;

export default async function RootLayout({ children }) {
  return <SiteShell>{children}</SiteShell>;
}


