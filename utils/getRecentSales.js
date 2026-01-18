import axios from "axios";
import { cookies } from "next/headers";

export async function getRecentSales() {
    let recentPackages = [];
    if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        return [
            { id: "6589678", amount: "100", currency: { symbol: "$" }, player: { name: "Buzz" } },
            { id: "6589679", amount: "20", currency: { symbol: "$" }, player: { name: "Buzz" } },
            { id: "6589681", amount: "25", currency: { symbol: "$" }, player: { name: "Buzz" } },
            { id: "6589682", amount: "60", currency: { symbol: "$" }, player: { name: "Buzz" } },
            { id: "6589683", amount: "15", currency: { symbol: "$" }, player: { name: "Buzz" } },
        ];
    } else {
        if (!process.env.SERVER_SECRET) return [];

        try {
            const res = await axios.get('https://plugin.tebex.io/payments', {
                headers: {
                    "X-Tebex-Secret": process.env.SERVER_SECRET,
                }
            });

            const payments = res.data;
            recentPackages = payments
                .filter(payment => payment.status === "Complete")
                .flatMap(payment => payment.packages.map(pkg => ({
                    id: pkg.id,
                    purchasedAt: payment.date
                })))
                .slice(-10);
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    const cookieStore = await cookies();
    let tokenToUse = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    if (cookieStore && cookieStore.get('demo-tebex-public-key')) {
        tokenToUse = cookieStore.get('demo-tebex-public-key').value;
    }

    try {
        const packageDetails = await Promise.all(recentPackages.map(async (pkg) => {
            const res = await axios.get(`https://headless.tebex.io/api/accounts/${tokenToUse}/packages/${pkg.id}`);
            return {
                ...res.data,
                purchasedAt: pkg.purchasedAt
            };
        }));

        return packageDetails;
    } catch (err) {
        console.log(err);
        return [];
    }
}
