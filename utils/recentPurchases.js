import axios from "axios";
import Cookies from "js-cookie";

export async function getRecentPurchases() {
    if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        return [
            {
                txn_id: "1234567890",
                date: "2024-12-20T01:00:00+00:00",
                quantity: 1,
                productInfo: {
                    id: 6589677,
                    name: "Example Bundle",
                    description: "<p>this is just a test. only a test. nothing more.</p>",
                    image: "https://dunb17ur4ymx4.cloudfront.net/packages/images/2ec23c318c2996e6a7b91a455ce8a4680b91a19c.png",
                    base_price: 4.99,
                    sales_tax: 0,
                    total_price: 4.99,
                    currency: "USD",
                    discount: 0,
                }
            },
            {
                txn_id: "1234567891",
                date: "2024-12-20T01:00:00+00:00",
                quantity: 1,
                productInfo: {
                    id: 6589679,
                    name: "Example Package #6",
                    description: "<p>this is just a test. only a test. nothing more.</p>",
                    image: "https://dunb17ur4ymx4.cloudfront.net/packages/images/2ec23c318c2996e6a7b91a455ce8a4680b91a19c.png",
                    base_price: 9.99,
                    sales_tax: 0,
                    total_price: 9.99,
                    currency: "USD",
                    discount: 0,
                }
            },
            {
                txn_id: "1234567890",
                date: "2024-12-20T01:00:00+00:00",
                quantity: 1,
                productInfo: {
                    id: 6589677,
                    name: "Example Bundle",
                    description: "<p>this is just a test. only a test. nothing more.</p>",
                    image: "https://dunb17ur4ymx4.cloudfront.net/packages/images/2ec23c318c2996e6a7b91a455ce8a4680b91a19c.png",
                    base_price: 4.99,
                    sales_tax: 0,
                    total_price: 4.99,
                    currency: "USD",
                    discount: 0,
                }
            },
            {
                txn_id: "1234567891",
                date: "2024-12-20T01:00:00+00:00",
                quantity: 1,
                productInfo: {
                    id: 6589679,
                    name: "Example Package #7",
                    description: "<p>this is just a test. only a test. nothing more.</p>",
                    image: "https://dunb17ur4ymx4.cloudfront.net/packages/images/2ec23c318c2996e6a7b91a455ce8a4680b91a19c.png",
                    base_price: 9.99,
                    sales_tax: 0,
                    total_price: 9.99,
                    currency: "USD",
                    discount: 0,
                }
            },
        ]
    }

    const userData = JSON.parse(Cookies.get('user') || 'null');
    const userId = userData?.id;

    if (!userId) {
        console.error("User ID not found in cookies");
        return [];
    }

    if (!process.env.SERVER_SECRET) return [];

    try {
        const response = await axios.get(`https://plugin.tebex.io/player/${userId}/packages`, {
            headers: {
                "X-Tebex-Secret": process.env.SERVER_SECRET,
            }
        });

        const packages = response.data;
        const recentPackages = packages
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        const detailedPackages = await Promise.all(recentPackages.map(async (pkg) => {
            const productInfo = await axios.get(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/packages/${pkg.package.id}`);
            return {
                ...pkg,
                productInfo: productInfo.data.data[0]
            };
        }));

        return detailedPackages;
    } catch (error) {
        console.error("Error fetching recent purchases:", error);
        return [];
    }
}
