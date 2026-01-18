import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent, coupon_code } = await req.json();

    const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;
    const response = await fetch(`https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}/coupons`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ coupon_code }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ message: errorData.detail || 'Failed to apply coupon' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ basket: data, message: "Coupon applied" });
}


