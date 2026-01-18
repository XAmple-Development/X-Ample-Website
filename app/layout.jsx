import "@mantine/carousel/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import '@mantine/tiptap/styles.css';
import '@mantine/dates/styles.css';
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BasketProvider } from "../contexts/BasketContext";
import { UserProvider } from '../contexts/UserContext';
import { buildTheme } from "../theme/theme";
import "../theme/theme.css";
import { getSettings } from "../utils/settingsServer";
import DemoPopup from "../components/DemoPopup";

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const settings = await getSettings();

  const theme = buildTheme(settings);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />


      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider forceColorScheme="dark" theme={theme}>
            <UserProvider>
              <ColorSchemeScript forceColorScheme="dark" />
              <BasketProvider>
                <ModalsProvider>
                  <DemoPopup />
                  <Notifications position="bottom-center" />
                  {children}
                </ModalsProvider>
              </BasketProvider>
            </UserProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
