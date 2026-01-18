'use server';

import { tebexClient } from "./tebexClient";
import { cookies } from "next/headers";

export async function getCategories() {
    const cookieStore = await cookies();
    const categories = await tebexClient("categories?includePackages=1", cookieStore);
    return categories.data;
}

