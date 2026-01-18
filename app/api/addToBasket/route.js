import { NextResponse } from "next/server";

export async function POST(req) {
    const { basketIdent, package_id, quantity, discordId, target_username, target_username_id } = await req.json();

    const response = await fetch(`https://headless.tebex.io/api/baskets/${basketIdent}/packages`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            package_id: package_id,
            quantity: quantity,
            variable_data: {
                discord_id: discordId
            },
            ...(target_username ? { target_username } : {}),
            ...(target_username_id ? { target_username_id } : {})
        }),
    }).then(res => res.json()).catch(err => console.log(err));

    if (response.status === 400) {
        console.log("Error when adding to basket", response)
        return NextResponse.json({ message: response.detail }, { status: 400 });
    }

    return NextResponse.json({ basket: response, message: "This product has been added to your cart" });
}