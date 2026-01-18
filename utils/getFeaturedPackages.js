import axios from "axios";
import { getSettings } from "./settingsServer";
import { cookies } from "next/headers";

export async function getFeaturedPackages() {
    const settings = await getSettings();
    const packageIds = settings.store.settings.featured_package_ids;
    const cookieStore = await cookies();
    
    let tokenToUse = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    if (cookieStore && cookieStore.get('demo-tebex-public-key')) {
        tokenToUse = cookieStore.get('demo-tebex-public-key').value;
    }

    try {
        const packageDetails = await Promise.all(packageIds.map(async (id) => {
            const res = await axios.get(`https://headless.tebex.io/api/accounts/${tokenToUse}/packages/${id}`);
            return res.data.data;
        }));

        return packageDetails;
    } catch (err) {
        console.log(err);
        return [];
    }
}
