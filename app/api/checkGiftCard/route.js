import { NextResponse } from "next/server";

export async function POST(req) {
    const { code } = await req.json();

    try {
        const response = await fetch(`https://plugin.tebex.io/gift-cards/lookup/${code}`, {
            method: 'GET',
            headers: {
                "X-Tebex-Secret": process.env.SERVER_SECRET
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            return NextResponse.json({ message: errorData.error || 'Invalid gift card code' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to check gift card' }, { status: 500 });
    }
} 