import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent, package_id, quantity } = await req.json();

    if (quantity === 0) {
        return removeFromBasket(basketIdent, package_id);
    }

    const response = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages/${package_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ message: errorData.detail || 'Failed to update quantity' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ basket: data, message: "Quantity updated successfully" });
}

async function removeFromBasket(basketIdent, package_id) {
    const response = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages/remove`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ package_id }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ message: errorData.detail || 'Failed to remove from basket' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ basket: data, message: "Package removed from basket" });
}