import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../helpers/localManager';
import { getSettings } from '../utils/settingsServer';
import { promises as fs } from 'fs';
import path from 'path';

export default getRequestConfig(async () => {
    const settings = await getSettings();
    const locale = settings.translation.settings.enabled ? await getUserLocale() : settings.translation.settings.default_language;
    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
    let messages = {};
    const isServerless = process.env.USING_SERVERLESS === 'true' || process.env.NEXT_RUNTIME === 'edge';
    if (isServerless) {
        try {
            messages = (await import(`../messages/${locale}.json`)).default;
        } catch {}
    } else {
        try {
            const raw = await fs.readFile(filePath, 'utf-8');
            messages = JSON.parse(raw);
        } catch {
            try {
                messages = (await import(`../messages/${locale}.json`)).default;
            } catch {}
        }
    }
    return {
        locale,
        messages
    };
});