import axios from "axios";

export async function getTopDonator() {
    if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        return {
            name: "Buzz",
            id: "13eb9092-8418-4136-a0c8-8f0924e61f99",
            total: 1000
        };
    }

    if (!process.env.SERVER_SECRET) return null;

    try {
        const res = await axios.get('https://plugin.tebex.io/payments', {
            headers: {
                "X-Tebex-Secret": process.env.SERVER_SECRET,
            }
        });

        const payments = res.data;
        const topDonator = payments
            .filter(payment => payment.status === "Complete")
            .reduce((max, payment) => {
                const amount = parseFloat(payment.amount);
                return amount > max.amount ? { ...payment.player, amount } : max;
            }, { amount: 0 });

        return {
            name: topDonator.name,
            id: topDonator.id,
            total: topDonator.amount
        };
    } catch (err) {
        console.log(err);
    }
}
