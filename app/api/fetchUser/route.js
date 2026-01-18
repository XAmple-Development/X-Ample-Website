import { NextResponse } from "next/server";
import { getSettings } from "../../../utils/settingsServer";
export async function GET(req) {
    const settings = await getSettings();
    const { searchParams } = new URL(req.url);
    let username = searchParams.get('username');
    const platform = searchParams.get('platform');
    const discordId = searchParams.get('discordId');

    if (platform === "bedrock" && !settings?.server.settings.bedrock_support) {
        return NextResponse.json({ error: "Bedrock support is not enabled on this server." }, { status: 400 });
    }

    if (platform === "bedrock") {
        username = "." + username;
    }

    let apiUrl;
    if (settings?.server.settings.bedrock_support && platform === "bedrock") {
        apiUrl = `https://api.geysermc.org/v2/utils/uuid/bedrock_or_java/${username.replace(".", "")}?prefix=.`;
    } else {
        apiUrl = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    }

    const data = await fetch(apiUrl)
        .then(res => res.json())
        .catch(err => {
            console.log(err);
            return NextResponse.json({ error: "We were unable to find information for this player. Are you sure they have joined the server before?" }, { status: 400 });
        });

    // Bedrock Player who does not exist (because they return a message for it for some reason...)
    if (username.startsWith(".") && data.message && data.message.includes("Unable to find user in our cache")) {
        return NextResponse.json({ error: "We were unable to find information for this Bedrock player. Are you sure they have joined the server before?" }, { status: 400 });
    }

    // Non-Bedrock Player who does not exist (because mojang api returns 200 even if they don't)
    if (!username.startsWith(".") && data.errorMessage && data.errorMessage.includes("Couldn't find any profile")) {
        return NextResponse.json({ error: "We were unable to find information for this player. Are you sure they have joined the server before?" }, { status: 400 });
    }

    // Add Discord ID to user data if provided
    if (discordId) {
        data.discordId = discordId;
    }

    return NextResponse.json({
        userData: data
    });
}