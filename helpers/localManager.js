'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
    return cookies().get(COOKIE_NAME)?.value || "en";
}

export async function setUserLocale(locale) {
    if (typeof window !== 'undefined') {
        document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000`;
    } else {
        cookies().set(COOKIE_NAME, locale);
    }
}