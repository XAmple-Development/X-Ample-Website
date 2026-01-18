import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent } = await req.json();

    const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    const response = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}/creator-codes/remove`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.detail || 'Failed to remove creator code' }, { status: response.status });
    }

    return NextResponse.json({ message: "Creator code removed" });
}


