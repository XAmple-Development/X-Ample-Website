import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent, card_number } = await req.json();

    const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    const response = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}/giftcards/remove`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ card_number }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.detail || 'Failed to remove gift card' }, { status: response.status });
    }

    return NextResponse.json({ message: "Gift card removed" });
}


