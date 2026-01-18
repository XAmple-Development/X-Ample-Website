import axios from "axios";

export async function getSale() {
    if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        return {
            id: 2,
            name: "25% FLASH SALE",
            effective: {
                type: "category",
                categories: [2855888]
            },
            discount: {
                type: "percentage",
                percentage: 20,
                value: 0
            },
            start: 1753401600,
            expire: 1766620800,
            order: 0
        }
    }

    if (!process.env.SERVER_SECRET) return null;

    const res = await axios.get('https://plugin.tebex.io/sales', {
        headers: {
            "X-Tebex-Secret": process.env.SERVER_SECRET,
        }
    });

    if (res?.data?.data?.length === 0) return null;

    return res.data.data[0];
}
